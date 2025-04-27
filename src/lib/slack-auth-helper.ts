import { adminDb } from '@/lib/firebase-admin';
import { SlackIntegration } from '@/types'; // Assuming types are correctly defined

interface GetValidSlackTokenResult {
    accessToken: string | null;
    error?: string;
    needsReAuth?: boolean; // Flag if refresh failed and user needs to reconnect
}

/**
 * Fetches Slack integration data for a user, refreshes the token if needed,
 * and returns a valid access token. Uses Firebase Admin SDK.
 * @param userId User's email or ID used in Firestore 'users' collection
 * @returns Promise containing the valid access token or error information
 */
export async function getValidSlackToken(userId: string): Promise<GetValidSlackTokenResult> {
    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error('Slack Helper: Missing Slack environment variables.');
        return { accessToken: null, error: 'Server configuration error' };
    }

    try {
        const userDocRef = adminDb.collection('users').doc(userId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            return { accessToken: null, error: 'User data not found' };
        }

        const integrations = userDoc.data()?.integrations;
        const slackData: SlackIntegration | undefined = integrations?.slack;

        if (!slackData?.accessToken) {
            return { accessToken: null, error: 'Slack integration not found or token missing' };
        }

        const now = Math.floor(Date.now() / 1000);
        const buffer = 5 * 60; // Refresh if within 5 minutes of expiry

        // Check if token needs refreshing (if expiresAt and refreshToken exist)
        if (slackData.expiresAt && slackData.refreshToken && now >= (slackData.expiresAt - buffer)) {
            console.log(`Slack token for ${userId} needs refreshing. Attempting refresh...`);

            const tokenUrl = 'https://slack.com/api/oauth.v2.access';
            const params = new URLSearchParams();
            params.append('client_id', clientId);
            params.append('client_secret', clientSecret);
            params.append('grant_type', 'refresh_token');
            params.append('refresh_token', slackData.refreshToken);

            const response = await fetch(tokenUrl, {
                body: params.toString(),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                method: 'POST',
            });

            const refreshData = await response.json();

            if (!refreshData.ok || !refreshData.access_token || !refreshData.refresh_token || !refreshData.expires_in) {
                console.error(`Slack Refresh Error for ${userId}:`, refreshData.error || 'Unknown');
                // Clear potentially invalid token data and signal re-auth needed
                await userDocRef.set({ integrations: { slack: null } }, { merge: true });
                return { accessToken: null, error: `Failed to refresh Slack token: ${refreshData.error || 'Unknown'}`, needsReAuth: true };
            }

            // Update Firestore with new tokens
            const newAccessToken = refreshData.access_token;
            const newRefreshToken = refreshData.refresh_token;
            const newExpiresAt = Math.floor(Date.now() / 1000) + refreshData.expires_in;
            const newScope = refreshData.scope;

            const updatedSlackData: SlackIntegration = {
                ...slackData, // Preserve existing fields like type, teamId etc.
                accessToken: newAccessToken,
                expiresAt: newExpiresAt,
                refreshToken: newRefreshToken,
                scope: newScope || slackData.scope, // Use new scope if provided
            };

            await userDocRef.set({ integrations: { slack: updatedSlackData } }, { merge: true });
            console.log(`Slack token for ${userId} refreshed successfully.`);
            return { accessToken: newAccessToken };

        } else if (!slackData.refreshToken || slackData.expiresAt === null) {
             // Handle case where rotation wasn't enabled initially - token might be long-lived
             console.warn(`Slack token for ${userId} lacks rotation details. Using potentially long-lived token.`);
             return { accessToken: slackData.accessToken };
        } else {
            // Token is valid and doesn't need refresh yet
            return { accessToken: slackData.accessToken };
        }

    } catch (error) {
        console.error(`Slack Helper: Exception for user ${userId}:`, error);
        return { accessToken: null, error: 'Internal server error during token validation/refresh' };
    }
} 