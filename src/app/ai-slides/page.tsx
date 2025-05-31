"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Type,
  Image,
  BarChart,
  Square,
  Play,
  Save,
  Download,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Palette,
  Layout,
  Sparkles,
  Send,
  Loader2,
  MessageSquare,
  X,
  Check
} from 'lucide-react';

interface Slide {
  id: string;
  content: SlideContent;
  layout: 'title' | 'content' | 'twoColumn' | 'image' | 'chart';
  background: string;
  animations: Animation[];
}

interface SlideContent {
  title?: string;
  subtitle?: string;
  body?: string;
  elements: SlideElement[];
}

interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'chart';
  content: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: Record<string, any>;
}

interface Animation {
  elementId: string;
  type: 'entrance' | 'emphasis' | 'exit';
  effect: string;
  duration: number;
}

interface ToolbarAction {
  category: string;
  action: string;
  value?: any;
  target?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  actions?: ToolbarAction[];
}

interface ChatSuggestion {
  id: string;
  title: string;
  description: string;
  edits: number;
}

export default function AISlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: '1',
      content: {
        title: 'Welcome to AI Slides',
        subtitle: 'Create presentations with natural language',
        elements: []
      },
      layout: 'title',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      animations: []
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
      title: 'Create a pitch deck for a peer to peer car sales platform',
      description: 'I\'ve taken an initial stab\n1. Created a basic outline for presentations\n2. Filled in some headers\n\nWhat do you think?',
      edits: 2
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
            type: 'text',
            content: 'New Text',
            position: { x: 100, y: 100 },
            size: { width: 200, height: 50 },
            style: { fontSize: '16px', color: '#000000' }
          };
          if (!slide.content.elements) slide.content.elements = [];
          slide.content.elements.push(newElement);
        } else if (action.action === 'shape' && action.value) {
          const newElement: SlideElement = {
            id: `element-${Date.now()}`,
            type: 'shape',
            content: action.value,
            position: { x: 150, y: 150 },
            size: { width: 100, height: 100 },
            style: { backgroundColor: '#3b82f6' }
          };
          if (!slide.content.elements) slide.content.elements = [];
          slide.content.elements.push(newElement);
        } else if (action.action === 'chart') {
          const newElement: SlideElement = {
            id: `element-${Date.now()}`,
            type: 'chart',
            content: 'Sample Chart',
            position: { x: 200, y: 150 },
            size: { width: 300, height: 200 },
            style: { backgroundColor: '#f3f4f6', border: '2px solid #d1d5db' }
          };
          if (!slide.content.elements) slide.content.elements = [];
          slide.content.elements.push(newElement);
        }
        break;
        
      case 'design':
        if (action.action === 'background' && action.value) {
          slide.background = action.value;
        }
        break;
        
      case 'slides':
        if (action.action === 'newSlide') {
          const newSlide: Slide = {
            id: Date.now().toString(),
            content: {
              title: 'New Slide',
              elements: []
            },
            layout: 'content',
            background: '#ffffff',
            animations: []
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
      role: 'user',
      content: command,
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      // Call the AI API
      const response = await fetch('/api/ai/slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          currentSlide,
          allSlides: slides,
          selectedElement
        })
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
        role: 'assistant',
        content: `✅ ${summary}`,
        timestamp: Date.now(),
        actions
      };
      setChatMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('AI command error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Sorry, I couldn\'t process that command. Please try being more specific.',
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
    onClick, 
    toolId, 
    tooltip 
  }: { 
    icon: any; 
    onClick: () => void; 
    toolId: string; 
    tooltip: string;
  }) => {
    const isHighlighted = highlightedTools.includes(toolId);
    
    return (
      <button
        onClick={onClick}
        className={`
          relative p-2 rounded hover:bg-gray-100 transition-all duration-200
          ${isHighlighted ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''}
        `}
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
            <ToolbarButton icon={Save} onClick={() => {}} toolId="file.save" tooltip="Save" />
            <ToolbarButton icon={Download} onClick={() => {}} toolId="file.export" tooltip="Export" />
            <div className="w-px h-4 bg-gray-300 mx-2" />
            
            {/* Text formatting */}
            <ToolbarButton 
              icon={Bold} 
              onClick={() => executeToolbarAction({ category: 'formatting', action: 'bold' })} 
              toolId="formatting.bold" 
              tooltip="Bold"
            />
            <ToolbarButton 
              icon={Italic} 
              onClick={() => executeToolbarAction({ category: 'formatting', action: 'italic' })} 
              toolId="formatting.italic" 
              tooltip="Italic" 
            />
            <ToolbarButton icon={Underline} onClick={() => {}} toolId="formatting.underline" tooltip="Underline" />
            
            <div className="w-px h-4 bg-gray-300 mx-2" />
            
            {/* Alignment */}
            <ToolbarButton icon={AlignLeft} onClick={() => {}} toolId="formatting.alignLeft" tooltip="Align Left" />
            <ToolbarButton 
              icon={AlignCenter} 
              onClick={() => executeToolbarAction({ category: 'formatting', action: 'alignment', value: 'center' })} 
              toolId="formatting.alignment" 
              tooltip="Align Center"
            />
            <ToolbarButton icon={AlignRight} onClick={() => {}} toolId="formatting.alignRight" tooltip="Align Right" />
            
            <div className="w-px h-4 bg-gray-300 mx-2" />
            
            {/* Insert elements */}
            <ToolbarButton 
              icon={Type} 
              onClick={() => executeToolbarAction({ category: 'insert', action: 'textBox' })} 
              toolId="insert.textBox" 
              tooltip="Insert Text"
            />
            <ToolbarButton icon={Image} onClick={() => {}} toolId="insert.image" tooltip="Insert Image" />
            <ToolbarButton 
              icon={Square} 
              onClick={() => executeToolbarAction({ category: 'insert', action: 'shape', value: 'rectangle' })} 
              toolId="insert.shape" 
              tooltip="Insert Shape"
            />
            <ToolbarButton icon={BarChart} onClick={() => {}} toolId="insert.chart" tooltip="Insert Chart" />
          </div>

          {/* Chat toggle */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${isChatOpen ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
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
                onClick={() => setCurrentSlideIndex(index)}
                className={`
                  relative cursor-pointer rounded-lg overflow-hidden border transition-all
                  ${index === currentSlideIndex ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}
                `}
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
              onClick={() => {
                const newSlide: Slide = {
                  id: Date.now().toString(),
                  content: { title: 'New Slide', elements: [] },
                  layout: 'content',
                  background: '#ffffff',
                  animations: []
                };
                setSlides([...slides, newSlide]);
              }}
              className="w-full aspect-[16/9] border border-dashed border-gray-300 rounded-lg hover:border-gray-400 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
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
                width: '960px', 
                height: '540px',
                background: currentSlide?.background || '#ffffff'
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
                      left: element.position.x,
                      top: element.position.y,
                      width: element.size.width,
                      height: element.size.height,
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
                  onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                  disabled={currentSlideIndex === 0}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 disabled:opacity-30 transition-opacity"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                  {currentSlideIndex + 1} / {slides.length}
                </span>
                <button
                  onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 disabled:opacity-30 transition-opacity"
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
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
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
                            onClick={() => handleSuggestionAccept(suggestion.id)}
                            className="p-1 hover:bg-green-100 rounded text-green-600"
                            title="Accept"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSuggestionReject(suggestion.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
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
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Message SlidesGPT"
                  disabled={isProcessing}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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