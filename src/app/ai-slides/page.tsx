"use client";

import { useEffect, useRef, useState } from 'react';

import { 
  AlignCenter, 
  AlignLeft, 
  AlignRight, 
  BarChart, 
  Bold, 
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Image,
  Italic,
  Loader2,
  MessageSquare,
  Plus,
  Save,
  Send,
  Square,
  Type,
  Underline,
  X
} from 'lucide-react';

interface Animation {
  duration: number;
  effect: string;
  elementId: string;
  type: 'emphasis' | 'entrance' | 'exit';
}

interface ChatMessage {
  id: string;
  content: string;
  role: 'assistant' | 'system' | 'user';
  timestamp: number;
  actions?: ToolbarAction[];
}

interface ChatSuggestion {
  id: string;
  description: string;
  edits: number;
  title: string;
}

interface Slide {
  id: string;
  animations: Animation[];
  background: string;
  content: SlideContent;
  layout: 'chart' | 'content' | 'image' | 'title' | 'twoColumn';
}

interface SlideContent {
  elements: SlideElement[];
  body?: string;
  subtitle?: string;
  title?: string;
}

interface SlideElement {
  id: string;
  content: any;
  position: { x: number; y: number };
  size: { height: number; width: number; };
  style: Record<string, any>;
  type: 'chart' | 'image' | 'shape' | 'text';
}

interface ToolbarAction {
  action: string;
  category: string;
  target?: string;
  value?: any;
}

export default function AISlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: '1',
      animations: [],
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      content: {
        elements: [],
        subtitle: 'Create presentations with natural language',
        title: 'Welcome to AI Slides'
      },
      layout: 'title'
    }
  ]);
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [highlightedTools, setHighlightedTools] = useState<string[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatSuggestions, setChatSuggestions] = useState<ChatSuggestion[]>([
    {
      id: '1',
      description: 'I\'ve taken an initial stab\n1. Created a basic outline for presentations\n2. Filled in some headers\n\nWhat do you think?',
      edits: 2,
      title: 'Create a pitch deck for a peer to peer car sales platform'
    }
  ]);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Early return if no slides
  if (!slides || slides.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading AI Slides...</p>
        </div>
      </div>
    );
  }

  // Current slide
  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Toolbar actions
  const executeToolbarAction = (action: ToolbarAction) => {
    if (!slides || slides.length === 0) return;
    
    const newSlides = [...slides];
    const slide = newSlides[currentSlideIndex];
    
    if (!slide || !slide.content) return;
    
    switch (action.category) {
      case 'design':
        if (action.action === 'background' && action.value) {
          slide.background = action.value;
        }
        break;
        
      case 'formatting':
        if (action.action === 'bold') {
          // Apply bold to selected text
          if (slide.content.title) {
            slide.content.title = `<b>${slide.content.title}</b>`;
          }
        } else if (action.action === 'italic') {
          if (slide.content.title) {
            slide.content.title = `<i>${slide.content.title}</i>`;
          }
        } else if (action.action === 'fontSize' && action.value) {
          // Update font size
          const element = slide.content.elements?.find(el => el.id === selectedElement);
          if (element) {
            element.style.fontSize = action.value;
          }
        } else if (action.action === 'alignment' && action.value) {
          // Update alignment
          const element = slide.content.elements?.find(el => el.id === selectedElement);
          if (element) {
            element.style.textAlign = action.value;
          }
        }
        break;
        
      case 'insert':
        if (action.action === 'textBox') {
          const newElement: SlideElement = {
            id: `element-${Date.now()}`,
            content: 'New Text',
            position: { x: 100, y: 100 },
            size: { height: 50, width: 200 },
            style: { color: '#000000', fontSize: '16px' },
            type: 'text'
          };
          if (!slide.content.elements) slide.content.elements = [];
          slide.content.elements.push(newElement);
        } else if (action.action === 'shape' && action.value) {
          const newElement: SlideElement = {
            id: `element-${Date.now()}`,
            content: action.value,
            position: { x: 150, y: 150 },
            size: { height: 100, width: 100 },
            style: { backgroundColor: '#3b82f6' },
            type: 'shape'
          };
          if (!slide.content.elements) slide.content.elements = [];
          slide.content.elements.push(newElement);
        } else if (action.action === 'chart') {
          const newElement: SlideElement = {
            id: `element-${Date.now()}`,
            content: 'Sample Chart',
            position: { x: 200, y: 150 },
            size: { height: 200, width: 300 },
            style: { backgroundColor: '#f3f4f6', border: '2px solid #d1d5db' },
            type: 'chart'
          };
          if (!slide.content.elements) slide.content.elements = [];
          slide.content.elements.push(newElement);
        }
        break;
        
      case 'slides':
        if (action.action === 'newSlide') {
          const newSlide: Slide = {
            id: Date.now().toString(),
            animations: [],
            background: '#ffffff',
            content: {
              elements: [],
              title: 'New Slide'
            },
            layout: 'content'
          };
          setSlides(prev => [...prev, newSlide]);
          setCurrentSlideIndex(slides.length);
          return; // Don't update current slides array since we're adding a new one
        } else if (action.action === 'deleteSlide' && slides.length > 1) {
          const updatedSlides = slides.filter((_, index) => index !== currentSlideIndex);
          setSlides(updatedSlides);
          setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
          return; // Don't update current slides array since we're removing one
        }
        break;
    }
    
    setSlides(newSlides);
    
    // Highlight the used toolbar button
    highlightToolbarButton(`${action.category}.${action.action}`);
  };

  const highlightToolbarButton = (toolId: string) => {
    setHighlightedTools([...highlightedTools, toolId]);
    setTimeout(() => {
      setHighlightedTools(prev => prev.filter(id => id !== toolId));
    }, 2000);
  };

  // Process AI commands
  const processAICommand = async (command: string) => {
    setIsProcessing(true);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: command,
      role: 'user',
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      // Call the AI API
      const response = await fetch('/api/ai/slides', {
        body: JSON.stringify({
          allSlides: slides,
          command,
          currentSlide,
          selectedElement
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to process command');
      }

      const { actions, summary } = data;
      
      // Execute each action
      for (const action of actions) {
        executeToolbarAction(action);
        // Small delay between actions for visual feedback
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        actions,
        content: `✅ ${summary}`,
        role: 'assistant',
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('AI command error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: '❌ Sorry, I couldn\'t process that command. Please try being more specific.',
        role: 'assistant',
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isProcessing) {
      processAICommand(inputMessage);
      setInputMessage('');
    }
  };

  const handleSuggestionAccept = (suggestionId: string) => {
    // Handle accepting a suggestion
    const suggestion = chatSuggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      processAICommand(suggestion.title);
      setChatSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    }
  };

  const handleSuggestionReject = (suggestionId: string) => {
    setChatSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    toolId, 
    tooltip, 
    onClick 
  }: { 
    icon: any; 
    toolId: string; 
    tooltip: string; 
    onClick: () => void;
  }) => {
    const isHighlighted = highlightedTools.includes(toolId);
    
    return (
      <button
        className={`
          relative p-2 rounded hover:bg-gray-100 transition-all duration-200
          ${isHighlighted ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''}
        `}
        onClick={onClick}
        title={tooltip}
      >
        <Icon className="w-4 h-4" />
        {isHighlighted && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
        )}
      </button>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Minimal Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {/* File operations */}
            <ToolbarButton onClick={() => {}} icon={Save} toolId="file.save" tooltip="Save" />
            <ToolbarButton onClick={() => {}} icon={Download} toolId="file.export" tooltip="Export" />
            <div className="w-px h-4 bg-gray-300 mx-2" />
            
            {/* Text formatting */}
            <ToolbarButton 
              onClick={() => executeToolbarAction({ action: 'bold', category: 'formatting' })} 
              icon={Bold} 
              toolId="formatting.bold" 
              tooltip="Bold"
            />
            <ToolbarButton 
              onClick={() => executeToolbarAction({ action: 'italic', category: 'formatting' })} 
              icon={Italic} 
              toolId="formatting.italic" 
              tooltip="Italic" 
            />
            <ToolbarButton onClick={() => {}} icon={Underline} toolId="formatting.underline" tooltip="Underline" />
            
            <div className="w-px h-4 bg-gray-300 mx-2" />
            
            {/* Alignment */}
            <ToolbarButton onClick={() => {}} icon={AlignLeft} toolId="formatting.alignLeft" tooltip="Align Left" />
            <ToolbarButton 
              onClick={() => executeToolbarAction({ action: 'alignment', category: 'formatting', value: 'center' })} 
              icon={AlignCenter} 
              toolId="formatting.alignment" 
              tooltip="Align Center"
            />
            <ToolbarButton onClick={() => {}} icon={AlignRight} toolId="formatting.alignRight" tooltip="Align Right" />
            
            <div className="w-px h-4 bg-gray-300 mx-2" />
            
            {/* Insert elements */}
            <ToolbarButton 
              onClick={() => executeToolbarAction({ action: 'textBox', category: 'insert' })} 
              icon={Type} 
              toolId="insert.textBox" 
              tooltip="Insert Text"
            />
            <ToolbarButton onClick={() => {}} icon={Image} toolId="insert.image" tooltip="Insert Image" />
            <ToolbarButton 
              onClick={() => executeToolbarAction({ action: 'shape', category: 'insert', value: 'rectangle' })} 
              icon={Square} 
              toolId="insert.shape" 
              tooltip="Insert Shape"
            />
            <ToolbarButton onClick={() => {}} icon={BarChart} toolId="insert.chart" tooltip="Insert Chart" />
          </div>

          {/* Chat toggle */}
          <button
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${isChatOpen ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex relative">
        {/* Slide thumbnails */}
        <div className="w-48 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
          <div className="space-y-2">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`
                  relative cursor-pointer rounded-lg overflow-hidden border transition-all
                  ${index === currentSlideIndex ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}
                `}
                onClick={() => setCurrentSlideIndex(index)}
              >
                <div className="aspect-[16/9] bg-white p-2 text-xs">
                  <div 
                    className="h-full rounded flex items-center justify-center text-white font-medium text-[10px]"
                    style={{ background: slide?.background || '#ffffff' }}
                  >
                    {slide?.content?.title || `Slide ${index + 1}`}
                  </div>
                </div>
                <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
            <button
              className="w-full aspect-[16/9] border border-dashed border-gray-300 rounded-lg hover:border-gray-400 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => {
                const newSlide: Slide = {
                  id: Date.now().toString(),
                  animations: [],
                  background: '#ffffff',
                  content: { elements: [], title: 'New Slide' },
                  layout: 'content'
                };
                setSlides([...slides, newSlide]);
              }}
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 p-8 bg-gray-50">
          <div className="h-full flex items-center justify-center">
            <div 
              ref={canvasRef}
              className="relative bg-white rounded-lg shadow-lg overflow-hidden"
              style={{ 
                background: currentSlide?.background || '#ffffff', 
                height: '540px',
                width: '960px'
              }}
            >
              {/* Slide content */}
              <div className="absolute inset-0 p-12">
                {currentSlide?.layout === 'title' && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-white">
                    <h1 className="text-6xl font-bold mb-4">{currentSlide?.content?.title || 'Title'}</h1>
                    <p className="text-2xl">{currentSlide?.content?.subtitle || ''}</p>
                  </div>
                )}
                {currentSlide?.layout === 'content' && (
                  <div className="h-full">
                    <h2 className="text-4xl font-bold mb-6">{currentSlide?.content?.title || 'Title'}</h2>
                    <div className="text-lg">{currentSlide?.content?.body || ''}</div>
                  </div>
                )}
                
                {/* Render elements */}
                {currentSlide?.content?.elements?.map(element => (
                  <div
                    key={element.id}
                    className={`absolute border-2 ${selectedElement === element.id ? 'border-blue-500' : 'border-transparent'} hover:border-gray-300 cursor-move`}
                    style={{
                      height: element.size.height,
                      left: element.position.x,
                      top: element.position.y,
                      width: element.size.width,
                      ...element.style
                    }}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    {element.type === 'text' && (
                      <div className="p-2 h-full flex items-center">{element.content}</div>
                    )}
                    {element.type === 'shape' && (
                      <div className="w-full h-full rounded" />
                    )}
                    {element.type === 'chart' && (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                        <div className="text-center">
                          <BarChart className="w-8 h-8 mx-auto mb-2" />
                          <div>Sample Chart</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Slide navigation */}
              <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                <button
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 disabled:opacity-30 transition-opacity"
                  disabled={currentSlideIndex === 0}
                  onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                  {currentSlideIndex + 1} / {slides.length}
                </span>
                <button
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 disabled:opacity-30 transition-opacity"
                  disabled={currentSlideIndex === slides.length - 1}
                  onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Chat Panel - Cursor-style */}
        {isChatOpen && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Chat</h3>
                <button
                  className="p-1 hover:bg-gray-100 rounded"
                  onClick={() => setIsChatOpen(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat suggestions */}
            {chatSuggestions.length > 0 && chatMessages.length === 0 && (
              <div className="p-4 border-b border-gray-200">
                <h4 className="text-lg font-medium mb-4">What do you want to create?</h4>
                <div className="space-y-3">
                  {chatSuggestions.map(suggestion => (
                    <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm">{suggestion.title}</h5>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            className="p-1 hover:bg-green-100 rounded text-green-600"
                            onClick={() => handleSuggestionAccept(suggestion.id)}
                            title="Accept"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                            onClick={() => handleSuggestionReject(suggestion.id)}
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 whitespace-pre-line mb-3">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {suggestion.edits} edits
                        </span>
                        <div className="flex gap-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Slide 1</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Slide 2</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && chatSuggestions.length === 0 && (
                <div className="text-center text-gray-500 mt-20">
                  <div>
                    <p className="text-lg mb-4">👋 What would you like to create?</p>
                    <p className="text-sm">I can help you build presentations with natural language commands.</p>
                  </div>
                </div>
              )}
              
              {chatMessages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[80%] p-3 rounded-lg text-sm
                      ${message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'}
                    `}
                  >
                    <div>{message.content}</div>
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-2 text-xs opacity-75">
                        Actions: {message.actions.map(a => `${a.action}`).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div className="p-4 border-t border-gray-200">
              <form className="flex space-x-2" onSubmit={handleSendMessage}>
                <input
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={isProcessing}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Message SlidesGPT"
                  type="text"
                />
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  disabled={!inputMessage.trim() || isProcessing}
                  type="submit"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 