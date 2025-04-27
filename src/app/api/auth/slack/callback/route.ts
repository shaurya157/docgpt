import { auth } from 'auth'; // Assuming next-auth setup provides this
import { NextRequest, NextResponse } from 'next/server';

import { adminDb } from '@/lib/firebase-admin'; // Import initialized adminDb

export async function GET(request: NextRequest) {
  const session = await auth(); // Get user session from next-auth
  const userEmail = session?.user?.email;

  if (!userEmail) {
    console.error('Slack OAuth Callback: User not authenticated.');
    // Redirect to login or show an error page
    return NextResponse.redirect(new URL('/error?message=Authentication required', request.url));
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  // Optional: Get and verify state parameter if you implement CSRF protection
  // const state = searchParams.get('state');

  if (!code) {
    console.error('Slack OAuth Callback: No code provided.');
    return NextResponse.redirect(new URL('/error?message=Slack authorization failed', request.url));
  }

  const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET; // Use the secret from backend env
  const redirectUri = process.env.NEXT_PUBLIC_SLACK_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('Slack OAuth Callback: Missing Slack environment variables.');
    return NextResponse.redirect(new URL('/error?message=Server configuration error', request.url));
  }

  try {
    // Exchange code for tokens
    const tokenUrl = 'https://slack.com/api/oauth.v2.access';

    // --- Alternative way to build form body (based on SO suggestion) ---
    const details = {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri
    };
    const formBody = Object.entries(details)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    // --- End alternative form body ---

    // --- Add Detailed Logging ---
    console.log('Attempting Slack token exchange with params:');
    console.log('  Code:', code ? 'Present' : 'MISSING!'); // Don't log the actual code for security
    console.log('  Client ID:', clientId);
    console.log('  Client Secret:', clientSecret ? 'Present' : 'MISSING!'); // Don't log the actual secret
    console.log('  Redirect URI:', redirectUri);
    // --- End Detailed Logging ---

    const response = await fetch(tokenUrl, {
      body: formBody, // Use manually constructed form body
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    const data = await response.json();

    // --- Restructured Response Handling ---
    if (!data.ok) {
        // Log the specific error and the full response from Slack
        console.error('Slack OAuth Callback: Slack API returned error. Error:', data.error || 'No error code provided', 'Response:', JSON.stringify(data));
        return NextResponse.redirect(new URL(`/error?message=Slack token exchange failed: ${data.error || 'Unknown'}`, request.url));
    }

    // Check for Bot token (most common for channel access scopes)
    if (data.access_token && data.refresh_token && typeof data.expires_in === 'number' && data.scope) {
        console.log("Received Slack Bot token WITH rotation details.");
        const accessToken = data.access_token; // Should start with xoxe.xoxb-... if rotation is enabled
        const refreshToken = data.refresh_token; // Should start with xoxe-1-... if rotation is enabled
        const expiresIn = data.expires_in; // Seconds (e.g., 43200 for 12 hours)
        const scope = data.scope; // Granted scopes like "channels:read,groups:read..."
        const teamId = data.team?.id;
        const botUserId = data.bot_user_id;

        const expiresAt = Math.floor(Date.now() / 1000) + expiresIn; // Calculate expiry timestamp

        // Store tokens in Firestore
        const userDocRef = adminDb.collection('users').doc(userEmail); // Use imported adminDb
        await userDocRef.set({
            integrations: {
                slack: {
                    accessToken: accessToken,
                    botUserId: botUserId,
                    expiresAt: expiresAt,
                    refreshToken: refreshToken,
                    scope: scope,
                    teamId: teamId,
                    type: 'slack',
                }
            }
        }, { merge: true });

        console.log(`Slack Bot token stored successfully for user: ${userEmail}`);

    // Scenario 2: Token Rotation Disabled OR Unexpected Response (Missing refresh/expiry)
    } else if (data.access_token && data.scope) {
        console.warn("Received Slack Bot token WITHOUT rotation details (refresh_token/expires_in). Storing long-lived token. Please ensure Token Rotation is enabled in Slack App settings.");
        const accessToken = data.access_token; // Likely a long-lived xoxb-... token
        const scope = data.scope;
        const teamId = data.team?.id;
        const botUserId = data.bot_user_id;

        const userDocRef = adminDb.collection('users').doc(userEmail);
        await userDocRef.set({
            integrations: {
                slack: {
                    accessToken: accessToken, // Store the long-lived token
                    botUserId: botUserId,
                    expiresAt: null,          // No expiry
                    refreshToken: null,       // No refresh token available
                    scope: scope,
                    teamId: teamId,
                    type: 'slack',
                }
            }
        }, { merge: true });

    // Check for User token (less likely needed here, but possible)
    } else if (data.authed_user?.access_token && data.authed_user?.refresh_token && data.authed_user?.expires_in && data.authed_user?.scope) {
        // Handle User token case
        console.warn("Received Slack User token. Storing but may not have needed scopes.", { scope: data.authed_user.scope, userId: data.authed_user.id });
        const userAccessToken = data.authed_user.access_token;
        const userRefreshToken = data.authed_user.refresh_token;
        const userExpiresIn = data.authed_user.expires_in;
        const userScope = data.authed_user.scope;
        const userId = data.authed_user.id;
        const userExpiresAt = Math.floor(Date.now() / 1000) + userExpiresIn;

        // Store user token info (adjust schema if needed)
        const userDocRef = adminDb.collection('users').doc(userEmail);
        // Decide how/if to store user tokens alongside bot tokens. Overwriting or separate field?
        // Example: storing in a separate field (adjust schema in Firestore accordingly)
        await userDocRef.set({ integrations: { slack_user: { /* user token details */ } } }, { merge: true });
        console.log(`Slack User token stored successfully for user: ${userEmail}`);
    } else {
        // If data.ok is true but structure is unexpected
        console.error('Slack OAuth Callback: Unexpected successful response structure:', JSON.stringify(data));
        return NextResponse.redirect(new URL('/error?message=Slack token exchange succeeded but response format unexpected', request.url));
    }

    // Redirect user back to the app if token handling was successful
    const appUrl = process.env.NEXTAUTH_URL || '/'; // Get base URL from env or default
    return NextResponse.redirect(new URL('/home', appUrl)); // Adjust redirect destination as needed

    // --- End Restructured Response Handling ---

  } catch (error) {
    console.error('Slack OAuth Callback: Exception during token exchange:', error);
    return NextResponse.redirect(new URL('/error?message=Internal server error', request.url));
  }
} 