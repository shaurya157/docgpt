import OpenAI from "openai";

export class ModelRouter {
  private deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  })
  private openai = new OpenAI();

  private async generateDeepSeek(system: string, input: string, stream: boolean = false) {
    if (stream) {
      const response = await this.deepseek.chat.completions.create({
        messages: [
          { content: system, role: "system" },
          { content: input, role: "user" }
        ],
        model: "deepseek-reasoner",
        stream: stream
      });
      return response.toReadableStream();
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
  
  private async generateOpenAI(system: string, input: string, model: string, stream: boolean = false) {
    if (stream) {
      const response = await this.openai.chat.completions.create({
        messages: [
          { content: system, role: "system" },
          { content: input, role: "user" }
        ],
        model: model,
        stream: stream
      });

      return response.toReadableStream();
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
    stream: boolean = false
  ): Promise<ReadableStream<any> | string> {
    const { model, provider } = this.getProviderAndModel(selectedModel);
    
    switch(provider) {
      case "deepseek":
        return this.generateDeepSeek(systemPrompt, userInput, stream);
      case "openai":
        return this.generateOpenAI(systemPrompt, userInput, model, stream);
      default:
        return this.generateOpenAI(systemPrompt, userInput, "gpt-4o", stream);
    }
  }
}