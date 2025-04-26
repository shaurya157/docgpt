'use client';

import React, { useState } from 'react';

import { useCustomContext } from '@/providers/custom-context-provider'; // Adjust path as needed

// Mock data - replace with actual API call
const mockDriveItems = [
  { id: 'file123', name: 'Project Proposal.docx', type: 'file' },
  { id: 'folder456', name: 'Meeting Notes', type: 'folder' },
  { id: 'file789', name: 'Design Mockups.png', type: 'file' },
  { id: 'file101', name: 'Budget Spreadsheet.xlsx', type: 'file' },
  { id: 'folder112', name: 'Shared Assets', type: 'folder' },
];

interface DriveFileSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriveFileSelectorModal = ({ isOpen, onClose }: DriveFileSelectorModalProps) => {
  const { addCustomContext } = useCustomContext();
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // Store selected item IDs

  const handleToggleItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleAddContext = () => {
    mockDriveItems
      .filter(item => selectedItems.includes(item.id))
      .forEach(item => {
        addCustomContext({
          name: `Drive: ${item.name}`,
          sourceId: item.id,
          type: 'drive',
          // Optionally add more metadata like item.type if needed
        });
      });
    onClose(); // Close modal after adding
    setSelectedItems([]); // Reset selection
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg"> {/* Slightly wider */}
        <h2 className="text-xl font-semibold mb-4">Select Google Drive Files/Folders</h2>
        <div className="max-h-80 overflow-y-auto border rounded p-2 mb-4"> {/* Taller list */}
          {/* TODO: Add loading/error states, potentially folder navigation */}
          {mockDriveItems.map(item => (
            <div key={item.id} className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded">
              <input
                id={`drive-${item.id}`}
                className="cursor-pointer"
                checked={selectedItems.includes(item.id)}
                onChange={() => handleToggleItem(item.id)}
                type="checkbox"
              />
              <span className="text-lg mr-1">{item.type === 'folder' ? '📁' : '📄'}</span> {/* Icon */}
              <label className="cursor-pointer flex-grow" htmlFor={`drive-${item.id}`}>
                {item.name}
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
              selectedItems.length > 0
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={selectedItems.length === 0}
            onClick={handleAddContext}
          >
            Add Selected ({selectedItems.length})
          </button>
        </div>
      </div>
    </div>
  );
};