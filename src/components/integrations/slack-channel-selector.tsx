import React, { useEffect, useState } from 'react';

import { Button } from '@/components/plate-ui/button';
import { Checkbox } from '@/components/plate-ui/checkbox';
// Assuming Label component is still needed, but commented out due to import issues
// import { Label } from '@/components/plate-ui/label';
import { useCustomContext } from '@/providers/custom-context-provider';
import { useUserDataContext } from '@/providers/user-data-provider';

// Mock Slack channel data structure
interface SlackChannel {
  id: string;
  name: string;
}

interface SlackChannelSelectorProps {
  onClose: () => void;
}

export const SlackChannelSelector: React.FC<SlackChannelSelectorProps> = ({ onClose }) => {
  const { addCustomContext } = useCustomContext();
  const { setUserIntegrations, userIntegrations } = useUserDataContext();

  // Local state specifically for this component's UI interactions
  const [isLoading, setIsLoading] = useState(false); // For auth redirect or channel fetching
  const [channels, setChannels] = useState<SlackChannel[]>([]); // Start empty, fetch later
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null); // For displaying errors

  // Determine authentication status from context
  const isSlackAuthenticated = !!userIntegrations?.slack?.integrated;

  useEffect(() => {
    const fetchChannels = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/slack/channels');
        const data = await response.json();

        if (!response.ok) {
          if (data.needsReAuth) {
            // TODO: Maybe update UserDataContext to reflect re-auth need?
            setError('Connection lost. Please reconnect Slack.');
            // Optionally force disconnect state: setUserIntegrations(prev => ({...prev, slack: undefined}));
          } else {
            setError(data.error || 'Failed to fetch channels.');
          }
          setChannels([]); // Clear channels on error
        } else {
          // Type assertion might be needed if data.channels isn't guaranteed
          setChannels((data.channels as SlackChannel[]) || []);
        }
      } catch (err) {
        console.error("Error fetching channels:", err);
        setError('An unexpected error occurred.');
        setChannels([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isSlackAuthenticated) {
      fetchChannels();
    } else {
        // Reset state if user becomes unauthenticated
        setChannels([]);
        setSelectedChannels(new Set());
        setIsLoading(false);
        setError(null);
    }
  }, [isSlackAuthenticated, setUserIntegrations]); // Re-run effect if auth status changes

  const handleAuthenticate = () => {
    setIsLoading(true); // Keep loading state for immediate feedback

    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_SLACK_REDIRECT_URI;
    const scopes = 'channels:read,groups:read,im:read,mpim:read,channels:history,groups:history,im:history,mpim:history,channels:join';

    if (!clientId || !redirectUri) {
      console.error('Slack environment variables (NEXT_PUBLIC_SLACK_CLIENT_ID, NEXT_PUBLIC_SLACK_REDIRECT_URI) are not set.');
      // TODO: Show an error message to the user
      setIsLoading(false);
      return;
    }

    // Construct the Slack authorization URL
    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`; // Use bot scopes by default

    // Redirect the user to Slack's authorization page
    window.location.href = authUrl;

    // No need for setTimeout or setIsAuthenticated(true) anymore.
    // The redirect will handle the next steps via the backend.
    // The setIsLoading(false) will effectively never be reached here due to the redirect.
  };

  const handleCheckboxChange = (channelId: string, checked: boolean | string) => {
    setSelectedChannels((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(channelId);
      } else {
        next.delete(channelId);
      }
      return next;
    });
  };

  const handleConfirmSelection = () => {
     if (selectedChannels.size > 0) {
        selectedChannels.forEach(channelId => {
            const channel = channels.find(ch => ch.id === channelId);
            if (channel) {
                // Pass channel name as content, type as 'slack_channel', and ID in metadata
                addCustomContext(
                    `#${channel.name}`, // Display name
                    'slack_channel',
                    { channelId: channel.id } // Pass ID in metadata
                );
            }
        });
        setSelectedChannels(new Set()); // Clear selection
        onClose(); // Close the modal
     }
  };

  if (!isSlackAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[200px]">
        <p className="text-center text-sm text-muted-foreground">
          Connect your Slack account to select channels.
        </p>
        {error && <p className="text-red-600 text-xs">{error}</p>}
        <Button disabled={isLoading} onClick={handleAuthenticate}>
          {isLoading ? 'Connecting...' : 'Connect to Slack'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-red-600 text-xs px-1">{error}</p>}
      <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 border rounded-md p-2 min-h-[100px]">
        {isLoading && (
           <p className="text-sm text-muted-foreground text-center py-4">Loading channels...</p>
        )}
        {!isLoading && channels.length === 0 && !error && (
           <p className="text-sm text-muted-foreground text-center py-4">No channels found or accessible. Ensure the app has permissions in your workspace.</p>
        )}
        {!isLoading && channels.map((channel) => (
            <div key={channel.id} className="flex items-center space-x-2 hover:bg-accent p-1 rounded">
              <Checkbox
                id={`slack-${channel.id}`}
                checked={selectedChannels.has(channel.id)}
                onCheckedChange={(checked) => handleCheckboxChange(channel.id, checked)}
              />
              <span
                className="font-normal cursor-pointer text-sm flex-grow"
                onClick={() => handleCheckboxChange(channel.id, !selectedChannels.has(channel.id))}
              >
                #{channel.name}
              </span>
            </div>
          ))}
       </div>
       <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={selectedChannels.size === 0 || isLoading} onClick={handleConfirmSelection}>
            Add Selected ({selectedChannels.size})
          </Button>
       </div>
    </div>
  );
}; 