import { auth } from 'auth'; // Assuming next-auth setup provides this
import { NextRequest, NextResponse } from 'next/server';

import { getValidSlackToken } from '@/lib/slack-auth-helper';

// Define expected channel structure from Slack API
interface SlackChannelInfo {
    id: string;
    is_channel: boolean; // true for public channels
    is_group: boolean;   // true for private channels
    is_im: boolean;      // true for direct messages
    is_mpim: boolean;    // true for multi-person direct messages
    name: string;
    // Add other fields if needed, e.g., is_member
}

export async function GET(request: NextRequest) {
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!userEmail) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        // 1. Get a valid Slack token (handles refresh internally)
        const tokenResult = await getValidSlackToken(userEmail);

        if (!tokenResult.accessToken) {
             // If refresh failed and needs re-auth, signal this to frontend
             if (tokenResult.needsReAuth) {
                 return NextResponse.json({ error: 'Slack re-authentication required', needsReAuth: true }, { status: 401 });
             }
            return NextResponse.json({ error: tokenResult.error || 'Failed to get valid Slack token' }, { status: 500 });
        }

        const accessToken = tokenResult.accessToken;

        // 2. Call Slack conversations.list API
        // We need pagination as the API limits results per call
        let allChannels: SlackChannelInfo[] = [];
        let cursor: string | undefined = undefined;
        const limit = 200; // Max allowed by Slack API is 1000, use smaller value for safety
        const types = 'public_channel,private_channel'; // Fetch public and private channels

        console.log(`Fetching Slack channels for user ${userEmail}`);

        do {
            const params = new URLSearchParams({
                exclude_archived: 'true', // Usually don't want archived channels
                limit: limit.toString(),
                types: types,
            });
            if (cursor) {
                params.append('cursor', cursor);
            }

            const response = await fetch(`https://slack.com/api/conversations.list?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                method: 'GET',
            });

            const data = await response.json();

            if (!data.ok) {
                console.error(`Slack API error fetching channels for ${userEmail}:`, data.error);
                 // Handle specific errors like token revocation, permission issues etc.
                 if (data.error === 'invalid_auth' || data.error === 'token_revoked') {
                     // Optionally try to clear the token in DB again or just signal re-auth
                     return NextResponse.json({ error: 'Slack authentication invalid or revoked.', needsReAuth: true }, { status: 401 });
                 }
                return NextResponse.json({ error: `Slack API error: ${data.error}` }, { status: 502 }); // Bad Gateway
            }

            allChannels = allChannels.concat(data.channels);
            cursor = data.response_metadata?.next_cursor;

        } while (cursor); // Continue fetching if Slack indicates more pages

        // 3. Filter/Map to desired format for frontend
        const channelList = allChannels.map(channel => ({
            id: channel.id,
            name: channel.name,
        }));

        console.log(`Successfully fetched ${channelList.length} channels for user ${userEmail}`);
        return NextResponse.json({ channels: channelList });

    } catch (error) {
        console.error(`Error in /api/slack/channels for ${userEmail}:`, error);
        return NextResponse.json({ error: 'Internal server error fetching channels' }, { status: 500 });
    }
} 