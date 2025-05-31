import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface SlideCommand {
  allSlides: any[];
  command: string;
  currentSlide: any;
  selectedElement?: string;
}

interface ToolbarAction {
  action: string;
  category: string;
  target?: string;
  value?: any;
}

export async function POST(req: NextRequest) {
  try {
    const { allSlides, command, currentSlide, selectedElement }: SlideCommand = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'OpenAI API key not configured'
      }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Create a system prompt for slide command processing
    const systemPrompt = `You are an AI assistant for a presentation software. Your job is to parse natural language commands and convert them into specific toolbar actions.

Available toolbar actions:
1. Formatting: bold, italic, underline, fontSize, fontColor, alignment (left, center, right)
2. Insert: textBox, image, shape, chart, table
3. Design: background, theme, colorScheme, layout
4. Slides: newSlide, deleteSlide, duplicateSlide, reorderSlides
5. Animations: entrance, emphasis, exit

Current slide context:
- Title: ${currentSlide?.content?.title || 'No title'}
- Layout: ${currentSlide?.layout || 'content'}
- Elements: ${currentSlide?.content?.elements?.length || 0} elements
- Selected element: ${selectedElement || 'none'}

Parse the user command and return a JSON array of toolbar actions. Each action should have:
- category: string (formatting, insert, design, slides, animations)
- action: string (specific action name)
- value: any (optional parameter)
- target: string (optional target element)

Examples:
"Make text bold" -> [{"category": "formatting", "action": "bold"}]
"Add a blue background" -> [{"category": "design", "action": "background", "value": "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"}]
"Insert a text box" -> [{"category": "insert", "action": "textBox"}]
"Create a new slide" -> [{"category": "slides", "action": "newSlide"}]

Return only the JSON array, no other text.`;

    const response = await openai.chat.completions.create({
      max_tokens: 500,
      messages: [
        { content: systemPrompt, role: "system" },
        { content: command, role: "user" }
      ],
      model: "gpt-4o",
      temperature: 0.3
    });

    const aiResponse = response.choices[0].message.content;
    
    try {
      // Parse the AI response as JSON
      const actions: ToolbarAction[] = JSON.parse(aiResponse || '[]');
      
      // Generate a human-readable summary
      const summary = generateActionSummary(actions);
      
      return NextResponse.json({
        actions,
        success: true,
        summary
      });
      
    } catch (parseError) {
      // If JSON parsing fails, try to extract actions manually
      const fallbackActions = extractActionsFromText(command);
      
      return NextResponse.json({
        actions: fallbackActions,
        fallback: true,
        success: true,
        summary: generateActionSummary(fallbackActions)
      });
    }

  } catch (error) {
    console.error('AI Slides API error:', error);
    return NextResponse.json({
      error: 'Failed to process command',
      success: false
    }, { status: 500 });
  }
}

function generateActionSummary(actions: ToolbarAction[]): string {
  if (actions.length === 0) return 'No actions to perform';
  
  const summaries = actions.map(action => {
    switch (action.action) {
      case 'alignment': return `Aligned text ${action.value}`;
      case 'background': return 'Changed background';
      case 'bold': return 'Made text bold';
      case 'chart': return 'Added chart';
      case 'deleteSlide': return 'Deleted slide';
      case 'emphasis': return 'Added emphasis animation';
      case 'entrance': return 'Added entrance animation';
      case 'exit': return 'Added exit animation';
      case 'fontSize': return `Changed font size to ${action.value}`;
      case 'image': return 'Added image';
      case 'italic': return 'Made text italic';
      case 'newSlide': return 'Created new slide';
      case 'shape': return 'Added shape';
      case 'textBox': return 'Added text box';
      case 'theme': return 'Applied theme';
      default: return `Performed ${action.action}`;
    }
  });
  
  return summaries.join(', ');
}

function extractActionsFromText(command: string): ToolbarAction[] {
  const lowerCommand = command.toLowerCase();
  const actions: ToolbarAction[] = [];
  
  // Text formatting
  if (lowerCommand.includes('bold')) {
    actions.push({ action: 'bold', category: 'formatting' });
  }
  if (lowerCommand.includes('italic')) {
    actions.push({ action: 'italic', category: 'formatting' });
  }
  if (lowerCommand.includes('underline')) {
    actions.push({ action: 'underline', category: 'formatting' });
  }
  
  // Font size
  if (lowerCommand.includes('bigger') || lowerCommand.includes('larger')) {
    actions.push({ action: 'fontSize', category: 'formatting', value: '32px' });
  }
  if (lowerCommand.includes('smaller')) {
    actions.push({ action: 'fontSize', category: 'formatting', value: '14px' });
  }
  
  // Alignment
  if (lowerCommand.includes('center')) {
    actions.push({ action: 'alignment', category: 'formatting', value: 'center' });
  }
  if (lowerCommand.includes('left align')) {
    actions.push({ action: 'alignment', category: 'formatting', value: 'left' });
  }
  if (lowerCommand.includes('right align')) {
    actions.push({ action: 'alignment', category: 'formatting', value: 'right' });
  }
  
  // Insert elements
  if (lowerCommand.includes('add') || lowerCommand.includes('insert')) {
    if (lowerCommand.includes('text')) {
      actions.push({ action: 'textBox', category: 'insert' });
    }
    if (lowerCommand.includes('image') || lowerCommand.includes('picture')) {
      actions.push({ action: 'image', category: 'insert' });
    }
    if (lowerCommand.includes('shape') || lowerCommand.includes('rectangle') || lowerCommand.includes('circle')) {
      actions.push({ action: 'shape', category: 'insert', value: 'rectangle' });
    }
    if (lowerCommand.includes('chart') || lowerCommand.includes('graph')) {
      actions.push({ action: 'chart', category: 'insert' });
    }
  }
  
  // Background changes
  if (lowerCommand.includes('background')) {
    if (lowerCommand.includes('blue')) {
      actions.push({ action: 'background', category: 'design', value: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' });
    } else if (lowerCommand.includes('red')) {
      actions.push({ action: 'background', category: 'design', value: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' });
    } else if (lowerCommand.includes('green')) {
      actions.push({ action: 'background', category: 'design', value: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' });
    } else if (lowerCommand.includes('white')) {
      actions.push({ action: 'background', category: 'design', value: '#ffffff' });
    }
  }
  
  // Slide operations
  if (lowerCommand.includes('new slide') || lowerCommand.includes('add slide')) {
    actions.push({ action: 'newSlide', category: 'slides' });
  }
  if (lowerCommand.includes('delete slide') || lowerCommand.includes('remove slide')) {
    actions.push({ action: 'deleteSlide', category: 'slides' });
  }
  
  return actions;
} 