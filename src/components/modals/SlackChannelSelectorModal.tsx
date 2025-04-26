'use client';

import React, { useState } from 'react';

import { useCustomContext } from '@/providers/custom-context-provider'; // Adjust path as needed

// Mock data - replace with actual API call
const mockChannels = [
  { id: 'C123ABC', name: '#general' },
  { id: 'C456DEF', name: '#random' },
  { id: 'C789GHI', name: '#dev-team' },
  { id: 'C101JKL', name: '#marketing' },
];

interface SlackChannelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SlackChannelSelectorModal = ({ isOpen, onClose }: SlackChannelSelectorModalProps) => {
  const { addCustomContext } = useCustomContext();
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]); // Store selected channel IDs

  const handleToggleChannel = (channelId: string) => {
    setSelectedChannels(prev =>
      prev.includes(channelId) ? prev.filter(id => id !== channelId) : [...prev, channelId]
    );
  };

  const handleAddContext = () => {
    mockChannels
      .filter(channel => selectedChannels.includes(channel.id))
      .forEach(channel => {
        addCustomContext({
          name: `Slack: ${channel.name}`,
          sourceId: channel.id,
          type: 'slack',
        });
      });
    onClose(); // Close modal after adding
    setSelectedChannels([]); // Reset selection
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Select Slack Channels</h2>
        <div className="max-h-60 overflow-y-auto border rounded p-2 mb-4">
          {/* TODO: Add loading/error states */}
          {mockChannels.map(channel => (
            <div key={channel.id} className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded">
              <input
                id={`slack-${channel.id}`}
                className="cursor-pointer"
                checked={selectedChannels.includes(channel.id)}
                onChange={() => handleToggleChannel(channel.id)}
                type="checkbox"
              />
              <label className="cursor-pointer flex-grow" htmlFor={`slack-${channel.id}`}>
                {channel.name}
              </label>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded text-white ${
              selectedChannels.length > 0
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={selectedChannels.length === 0}
            onClick={handleAddContext}
          >
            Add Selected ({selectedChannels.length})
          </button>
        </div>
      </div>
    </div>
  );
};