import OpenAI from "openai";

import { CustomStreamController } from "@/utils/custom-stream";

export class ModelRouter {
  private deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  })
  private openai = new OpenAI();

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

  private getProviderAndModel(selectedModel: string): { model: string; provider: "deepseek" | "openai", } {
    if (selectedModel.toLowerCase().includes("open ai")) {
      // Map OpenAI models
      const modelMap = {
        "Open AI 4o": "gpt-4o",
        "Open AI O1": "o1"
      };
      return {
        model: modelMap[selectedModel] || "gpt-4o", // default to gpt-4o if not found
        provider: "openai"
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
      const result = await (provider === "deepseek" 
        ? this.generateDeepSeek(systemPrompt, userInput, stream ? streamController : undefined)
        : this.generateOpenAI(systemPrompt, userInput, model, stream ? streamController : undefined));
      
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