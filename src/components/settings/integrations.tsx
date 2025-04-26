'use client'; // Required for useState and potentially onClick handlers

import React, { useState } from 'react';

// Mock connection status - replace with actual logic later
const useMockConnection = (initialStatus = false) => {
  const [isConnected, setIsConnected] = useState(initialStatus);
  const connect = () => setIsConnected(true); // Placeholder
  const disconnect = () => setIsConnected(false); // Placeholder
  return { connect, disconnect, isConnected };
};

export const Integrations = () => {
  const { connect: connectSlack, disconnect: disconnectSlack, isConnected: isSlackConnected } = useMockConnection();
  const { connect: connectDrive, disconnect: disconnectDrive, isConnected: isDriveConnected } = useMockConnection();

  // TODO: Implement actual OAuth connection flows for Slack and Drive

  const buttonClasses = "px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300";
  const disconnectButtonClasses = "px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200";
  const cardClasses = "border rounded-lg shadow-sm overflow-hidden";
  const cardHeaderClasses = "p-4 border-b";
  const cardTitleClasses = "text-lg font-semibold";
  const cardDescriptionClasses = "text-sm text-gray-500 mt-1";
  const cardContentClasses = "p-4";

  return (
    <div className="space-y-6">
      {/* Slack Integration Card */}
      <div className={cardClasses}>
        <div className={cardHeaderClasses}>
          <h3 className={cardTitleClasses}>Slack</h3>
          <p className={cardDescriptionClasses}>Connect your Slack account to add context from channels.</p>
        </div>
        <div className={cardContentClasses}>
          {isSlackConnected ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">Connected</span>
              <button className={disconnectButtonClasses} onClick={disconnectSlack}>
                Disconnect
              </button>
            </div>
          ) : (
            <button className={buttonClasses} onClick={connectSlack}>Connect Slack</button>
          )}
        </div>
      </div>

      {/* Google Drive Integration Card */}
      <div className={cardClasses}>
        <div className={cardHeaderClasses}>
          <h3 className={cardTitleClasses}>Google Drive</h3>
          <p className={cardDescriptionClasses}>Connect your Google Drive account to add context from files and folders.</p>
        </div>
        <div className={cardContentClasses}>
          {isDriveConnected ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">Connected</span>
              <button className={disconnectButtonClasses} onClick={disconnectDrive}>
                Disconnect
              </button>
            </div>
          ) : (
            <button className={buttonClasses} onClick={connectDrive}>Connect Google Drive</button>
          )}
        </div>
      </div>
    </div>
  );
};