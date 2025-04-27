export interface Chat {
  id: string;
  chatName: string;
  documentIds: string[];
  files: File[];
  messages: Message[];
  userId: string;
}

export interface Document {
  id: string;
  chatId: string;
  document: any[];
  documentName: string;
  documentOwnerId: string;
}

export interface File {
  fileIds: string[];
  fileName: string;
}

export interface Message {
  id: string;
  content: string;
  fileNames: string[];
  role: 'assistant' | 'user';
  reasoning?: string;
}

export interface NavItem {
  title: string;
  disabled?: boolean;
  external?: boolean;
  href?: string;
}

export interface PopoverPosition {
  left: number;
  top: number;
}

export interface StreamingState {
  document: {
    content: string;
    isStreaming: boolean;
  };
  isProcessingDocument: boolean;
  isProcessingEdit: boolean; // Add flag for edit processing
  message: Message;
  reasoning: string;
}

export interface Template {
  id: string;
  template: any[];
  templateName: string;
  templateOwnerId: string;
}

// Represents the FULL data stored for a Slack integration in Firestore (Backend Use)
export interface SlackIntegration {
  type: 'slack';
  accessToken: string;
  refreshToken: string | null; // Can be null if rotation wasn't enabled initially
  expiresAt: number | null;    // Can be null if rotation wasn't enabled initially
  scope: string;
  teamId?: string;
  botUserId?: string;
  // Add other fields if stored, like teamName etc.
}

// --- Added Interface for Frontend Status ---
// Represents the non-sensitive status information safe for the frontend context
export interface SlackIntegrationStatus {
  integrated: boolean;
  expiresAt?: number | null; // Optional: useful for UI hints, but backend handles actual expiry check
}

// Represents the map of all possible integrations for a user
export interface UserIntegrations {
  slack?: SlackIntegrationStatus; // Use the frontend-safe status type
  // google_drive?: GoogleDriveIntegration; // Example for future
}

// --- End Added Interfaces ---
