import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface ToolbarAction {
  category: string;
  action: string;
  value?: any;
  target?: string;
}

interface SlideCommand {
  command: string;
  currentSlide: any;
  allSlides: any[];
  selectedElement?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { command, currentSlide, allSlides, selectedElement }: SlideCommand = await req.json();

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
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: command }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const aiResponse = response.choices[0].message.content;
    
    try {
      // Parse the AI response as JSON
      const actions: ToolbarAction[] = JSON.parse(aiResponse || '[]');
      
      // Generate a human-readable summary
      const summary = generateActionSummary(actions);
      
      return NextResponse.json({
        actions,
        summary,
        success: true
      });
      
    } catch (parseError) {
      // If JSON parsing fails, try to extract actions manually
      const fallbackActions = extractActionsFromText(command);
      
      return NextResponse.json({
        actions: fallbackActions,
        summary: generateActionSummary(fallbackActions),
        success: true,
        fallback: true
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
      case 'bold': return 'Made text bold';
      case 'italic': return 'Made text italic';
      case 'fontSize': return `Changed font size to ${action.value}`;
      case 'alignment': return `Aligned text ${action.value}`;
      case 'textBox': return 'Added text box';
      case 'image': return 'Added image';
      case 'shape': return 'Added shape';
      case 'chart': return 'Added chart';
      case 'background': return 'Changed background';
      case 'theme': return 'Applied theme';
      case 'newSlide': return 'Created new slide';
      case 'deleteSlide': return 'Deleted slide';
      case 'entrance': return 'Added entrance animation';
      case 'emphasis': return 'Added emphasis animation';
      case 'exit': return 'Added exit animation';
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
    actions.push({ category: 'formatting', action: 'bold' });
  }
  if (lowerCommand.includes('italic')) {
    actions.push({ category: 'formatting', action: 'italic' });
  }
  if (lowerCommand.includes('underline')) {
    actions.push({ category: 'formatting', action: 'underline' });
  }
  
  // Font size
  if (lowerCommand.includes('bigger') || lowerCommand.includes('larger')) {
    actions.push({ category: 'formatting', action: 'fontSize', value: '32px' });
  }
  if (lowerCommand.includes('smaller')) {
    actions.push({ category: 'formatting', action: 'fontSize', value: '14px' });
  }
  
  // Alignment
  if (lowerCommand.includes('center')) {
    actions.push({ category: 'formatting', action: 'alignment', value: 'center' });
  }
  if (lowerCommand.includes('left align')) {
    actions.push({ category: 'formatting', action: 'alignment', value: 'left' });
  }
  if (lowerCommand.includes('right align')) {
    actions.push({ category: 'formatting', action: 'alignment', value: 'right' });
  }
  
  // Insert elements
  if (lowerCommand.includes('add') || lowerCommand.includes('insert')) {
    if (lowerCommand.includes('text')) {
      actions.push({ category: 'insert', action: 'textBox' });
    }
    if (lowerCommand.includes('image') || lowerCommand.includes('picture')) {
      actions.push({ category: 'insert', action: 'image' });
    }
    if (lowerCommand.includes('shape') || lowerCommand.includes('rectangle') || lowerCommand.includes('circle')) {
      actions.push({ category: 'insert', action: 'shape', value: 'rectangle' });
    }
    if (lowerCommand.includes('chart') || lowerCommand.includes('graph')) {
      actions.push({ category: 'insert', action: 'chart' });
    }
  }
  
  // Background changes
  if (lowerCommand.includes('background')) {
    if (lowerCommand.includes('blue')) {
      actions.push({ category: 'design', action: 'background', value: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' });
    } else if (lowerCommand.includes('red')) {
      actions.push({ category: 'design', action: 'background', value: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' });
    } else if (lowerCommand.includes('green')) {
      actions.push({ category: 'design', action: 'background', value: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' });
    } else if (lowerCommand.includes('white')) {
      actions.push({ category: 'design', action: 'background', value: '#ffffff' });
    }
  }
  
  // Slide operations
  if (lowerCommand.includes('new slide') || lowerCommand.includes('add slide')) {
    actions.push({ category: 'slides', action: 'newSlide' });
  }
  if (lowerCommand.includes('delete slide') || lowerCommand.includes('remove slide')) {
    actions.push({ category: 'slides', action: 'deleteSlide' });
  }
  
  return actions;
} 