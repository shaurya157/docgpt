"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface ProcessedFile {
  fileName: string;
  status: 'success' | 'error' | 'processing';
  contentType?: string;
  chunksCreated?: number;
  error?: string;
  preview?: string;
}

// Simple file upload zone component (inline for now)
const FileUploadZone = ({ onFileUpload, isProcessing }: { 
  onFileUpload: (files: File[]) => void; 
  isProcessing: boolean; 
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <div className="space-y-4">
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-600 mt-4 font-medium">Processing files...</p>
            </div>
          ) : (
            <>
              <div className="text-6xl mb-4">📁</div>
              <div>
                <p className="text-xl font-medium text-gray-900 mb-2">Upload files here</p>
                <p className="text-gray-600 mb-4">Select files to analyze</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*,audio/*,video/*,.pdf,.txt,.doc,.docx"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <p><strong>Supported formats:</strong></p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">Images (JPG, PNG, GIF)</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">Audio (MP3, WAV, M4A)</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">Video (MP4, MOV, AVI)</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">Documents (PDF, DOC, TXT)</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple file preview component (inline for now)
const FilePreview = ({ file }: { file: ProcessedFile }) => {
  const getFileIcon = (fileName: string, contentType?: string) => {
    if (contentType?.includes('image')) return '🖼️';
    if (contentType?.includes('audio')) return '🎵';
    if (contentType?.includes('video')) return '🎥';
    if (fileName.endsWith('.pdf')) return '📄';
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return '📝';
    return '📄';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'processing': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor(file.status)}`}>
      <div className="flex items-start space-x-3">
        <div className="text-2xl">
          {getFileIcon(file.fileName, file.contentType)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium truncate">{file.fileName}</h4>
            <span className="text-lg">{getStatusIcon(file.status)}</span>
          </div>
          <div className="text-sm mt-1">
            {file.status === 'success' && (
              <div className="space-y-1">
                <p>✨ Processed as {file.contentType?.replace('_', ' ')}</p>
                {file.chunksCreated && (
                  <p>📊 Created {file.chunksCreated} searchable chunks</p>
                )}
                {file.preview && (
                  <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs">
                    <p className="font-medium">Preview:</p>
                    <p className="text-gray-700">{file.preview}</p>
                  </div>
                )}
              </div>
            )}
            {file.status === 'error' && (
              <p className="text-red-700">❌ {file.error}</p>
            )}
            {file.status === 'processing' && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <p>Processing...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple chat component (inline for now)
const MultimodalChat = ({ hasFiles }: { hasFiles: boolean }) => {
  const [messages, setMessages] = useState<Array<{id: string, role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !hasFiles) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat/multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          chatId: 'multimodal-demo',
          userId: 'demo-user'
        })
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';

        const assistantMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: '' };
        setMessages(prev => [...prev, assistantMessage]);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('0:')) {
                try {
                  const data = JSON.parse(line.slice(2));
                  if (data.type === 'text-delta') {
                    assistantContent += data.textDelta;
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === assistantMessage.id 
                          ? { ...msg, content: assistantContent }
                          : msg
                      )
                    );
                  }
                } catch (e) {
                  // Ignore parsing errors
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuestions = [
    "What's in this image?",
    "Summarize the main points",
    "What are the key insights?",
    "Extract any important data or numbers"
  ];

  return (
    <div className="h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            {hasFiles ? (
              <div>
                <p className="text-lg mb-4">🎉 Files processed! Ask me anything about them.</p>
                <div className="grid grid-cols-1 gap-2">
                  {exampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(question)}
                      className="p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 transition-colors"
                    >
                      "{question}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-lg">👋 Upload some files to get started!</p>
                <p className="text-sm mt-2">I can analyze images, transcribe audio, read documents, and more.</p>
              </div>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasFiles ? "Ask about your files..." : "Upload files first to start chatting"}
            disabled={!hasFiles || isLoading}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || !hasFiles || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default function MultimodalDemo() {
  const { data: session } = useSession();
  const [uploadedFiles, setUploadedFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (files: File[]) => {
    setIsProcessing(true);
    
    // Add files as "processing" immediately for UI feedback
    const processingFiles = files.map(file => ({
      fileName: file.name,
      status: 'processing' as const
    }));
    setUploadedFiles(prev => [...prev, ...processingFiles]);

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('userId', session?.user?.email || 'demo-user');
    formData.append('chatId', 'multimodal-demo');

    try {
      const response = await fetch('/api/ai/multimodal', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update the processing files with results
      setUploadedFiles(prev => {
        const updated = [...prev];
        data.results.forEach((result: ProcessedFile) => {
          const index = updated.findIndex(f => 
            f.fileName === result.fileName && f.status === 'processing'
          );
          if (index !== -1) {
            updated[index] = result;
          }
        });
        return updated;
      });
      
    } catch (error) {
      console.error('Upload failed:', error);
      
      // Mark processing files as failed
      setUploadedFiles(prev => 
        prev.map(file => 
          file.status === 'processing' 
            ? { ...file, status: 'error' as const, error: error.message }
            : file
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFiles = () => {
    setUploadedFiles([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Multimodal File Chat Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload images, audio, video, or documents and have natural conversations about their content. 
            Our AI can see, hear, and read to understand your files.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* File Upload Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Upload Files</h2>
                {uploadedFiles.length > 0 && (
                  <button
                    onClick={handleClearFiles}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <FileUploadZone 
                onFileUpload={handleFileUpload}
                isProcessing={isProcessing}
              />

              {/* File Type Examples */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Try uploading:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                  <div>📸 Images (screenshots, photos, diagrams)</div>
                  <div>🎵 Audio (recordings, music, podcasts)</div>
                  <div>🎥 Videos (tutorials, presentations)</div>
                  <div>📄 Documents (PDFs, Word docs, text)</div>
                </div>
              </div>
            </div>

            {/* Processed Files */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Processed Files ({uploadedFiles.length})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <FilePreview key={`${file.fileName}-${index}`} file={file} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chat Section */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Chat with Your Files</h2>
              <p className="text-sm text-gray-600 mt-1">
                Ask questions about your uploaded content
              </p>
            </div>
            
            <MultimodalChat 
              hasFiles={uploadedFiles.some(f => f.status === 'success')}
            />
          </div>
        </div>

        {/* Example Questions */}
        {uploadedFiles.some(f => f.status === 'success') && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">💡 Try asking:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                "What's in this image?",
                "Summarize the main points",
                "What did the speaker say about...?",
                "Extract the key data from this document",
                "Compare the content across files",
                "What are the action items mentioned?"
              ].map((question, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                  "{question}"
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 