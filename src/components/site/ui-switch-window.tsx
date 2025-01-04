'use client';

import { useDocument } from '@/providers/document-provider';
import { useUserSettings } from '@/providers/user-settings-provider';
import { useSession } from 'next-auth/react';

import PlateEditor from '@/components/plate-editor';
import { Button } from '@/components/plate-ui/button';
import { ChatWindow } from '@/components/site/chat-window';

export function UiSwitchWindow() {
  const { ui, setUi } = useUserSettings();
  const { data: session } = useSession();
  const { activeTemplate } = useDocument();
  const toggleUi = () => {
    ui == 'document' ? setUi('chat') : setUi('document');
  };

  return (
    <div>
      {session?.user ? (
        <div>
          <Button onClick={toggleUi}>
            {ui == 'document' ? 'Use Chat UI' : 'Use Document UI'}
          </Button>
          {ui == 'document' ? (
            <div className="max-w-[calc(100vw-32px)] rounded-lg border bg-background shadow sm:max-w-[min(calc(100vw-64px),1336px)]">
              <PlateEditor />
            </div>
          ) : (
            <ChatWindow />
          )}
        </div>
      ) : (
        <div className="max-w-[calc(100vw-32px)] rounded-lg border bg-background shadow sm:max-w-[min(calc(100vw-64px),1336px)]">
          <PlateEditor />
        </div>
      )}
      {activeTemplate ? (
        <div>Current template: {activeTemplate['templateName']}</div>
      ) : (
        <></>
      )}
    </div>
  );
}
