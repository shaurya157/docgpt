import OpenAI from "openai";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

import { CustomStreamController } from "@/utils/custom-stream";

export class ModelRouter {
  private deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  })
  private openai = new OpenAI();
  private google = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

  private async generateDeepSeek(
    system: string,
    input: string,
    streamController?: CustomStreamController
  ) {
    if (streamController) {
      const response = await this.deepseek.chat.completions.create({
        messages: [
          { content: system, role: "system" },
          { content: input, role: "user" }
        ],
        model: "deepseek-reasoner",
        stream: true
      });

      let accumulatedContent = '';
      for await (const chunk of response) {
        const reasoning = chunk.choices[0]?.delta?.["reasoning_content"] || '';
        const content = chunk.choices[0]?.delta?.content || '';
        
        if (reasoning) {
          streamController.writeReasoning(reasoning, "deepseek");
        }
        if (content) {
          accumulatedContent += content;
          streamController.writePartialResult(content);
        }
      }
      return accumulatedContent;
    } else {
      const response = await this.deepseek.chat.completions.create({
        messages: [
          { content: system, role: "system" },
          { content: input, role: "user" }
        ],
        model: "deepseek-reasoner"
      });

      return response.choices[0].message.content!;
    }
  }
  
  private async generateOpenAI(
    system: string,
    input: string,
    model: string,
    streamController?: CustomStreamController
  ) {
    if (streamController) {
      const response = await this.openai.chat.completions.create({
        messages: [
          { content: system, role: "system" },
          { content: input, role: "user" }
        ],
        model: model,
        stream: true
      });

      let accumulatedContent = '';
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          accumulatedContent += content;
          streamController.writePartialResult(content);
        }
      }
      return accumulatedContent;
    } else {
      const response = await this.openai.chat.completions.create({
        messages: [
          { content: system, role: "system" },
          { content: input, role: "user" }
        ],
        model: model
      });

      return response.choices[0].message.content!;
    }
  }

  private async generateGoogle(
    system: string,
    input: string,
    model: string,
    streamController?: CustomStreamController
  ) {
    const genAI = this.google.getGenerativeModel({
      model: model,
      systemInstruction: system,
      safetySettings: [ // Add appropriate safety settings
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    if (streamController) {
      const result = await genAI.generateContentStream(input);
      let accumulatedContent = '';
      for await (const chunk of result.stream) {
        const content = chunk.text();
        if (content) {
          accumulatedContent += content;
          streamController.writePartialResult(content);
        }
      }
       // Google's API doesn't provide reasoning content in the same way DeepSeek does.
      // If needed, you might need a separate mechanism or prompt engineering to extract reasoning.
      return accumulatedContent;

    } else {
      const result = await genAI.generateContent(input);
      const response = result.response;
      return response.text();
    }
  }

  private getProviderAndModel(selectedModel: string): { model: string; provider: "deepseek" | "openai" | "google", } {
    const lowerCaseModel = selectedModel.toLowerCase();

    if (lowerCaseModel.includes("open ai")) {
      // Map OpenAI models
      const modelMap = {
        "Open AI 4o": "gpt-4o",
        "Open AI O1": "o1"
      };
      return {
        model: modelMap[selectedModel] || "gpt-4o", // default to gpt-4o if not found
        provider: "openai"
      };
    } else if (lowerCaseModel.includes("google") || lowerCaseModel.includes("gemini")) {
       // Map Google models
       // Add other Gemini models as needed
      const modelMap = {
        "Google Gemini-2.5-pro-exp-03-25": "gemini-2.5-pro-exp-03-25", // Example mapping
        "Google Gemini 1.5 Pro": "gemini-1.5-pro-latest",
        "Google Gemini 1.5 Flash": "gemini-1.5-flash-latest"
      };
      return {
        model: modelMap[selectedModel] || "gemini-1.5-pro-latest", // default to 1.5 pro if not found
        provider: "google"
      };
    } else {
      // For DeepSeek models
      const modelMap = {
        "DeepSeek Chat": "deepseek-chat",
        "DeepSeek R1": "deepseek-reasoner"
      };
      return {
        model: modelMap[selectedModel] || "deepseek-chat", // default to deepseek-chat if not found
        provider: "deepseek"
      };
    }
  }

  async generate(
    selectedModel: string,
    systemPrompt: string,
    userInput: string,
    stream: boolean = false,
    streamController?: CustomStreamController
  ): Promise<string> {
    const { model, provider } = this.getProviderAndModel(selectedModel);
    
    try {
      let result: string;
      switch (provider) {
        case "deepseek":
          result = await this.generateDeepSeek(systemPrompt, userInput, stream ? streamController : undefined);
          break;
        case "openai":
          result = await this.generateOpenAI(systemPrompt, userInput, model, stream ? streamController : undefined);
          break;
        case "google":
           result = await this.generateGoogle(systemPrompt, userInput, model, stream ? streamController : undefined);
           break;
        default:
          // Should not happen with the current logic, but good practice
           throw new Error(`Unsupported provider: ${provider}`);
      }
      
      // splitting stream output
      if (streamController) {
        streamController.writePartialResult("\n\n");
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      if (streamController) {
        streamController.writeSystemMessage(`Error during generation: ${errorMessage}`);
      }
      throw error;
    }
  }
}