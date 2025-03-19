import OpenAI from "openai";

export class ModelRouter {
  private deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  })
  private openai = new OpenAI();
  
  private async generateDeepSeek(system: string, input: string, stream: boolean = false) {
    console.log("Generating with DeepSeek");
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

  private async generateOpenAI(system: string, input: string, stream: boolean = false) {
    console.log("Generating with OpenAI");

    if (stream) {
      const response = await this.openai.chat.completions.create({
        messages: [
          { content: system, role: "system" },
          { content: input, role: "user" }
        ],
        model: "gpt-4o",
        stream: stream
      });

      return response.toReadableStream();
    } else {
      const response = await this.openai.chat.completions.create({
        messages: [
          { content: system, role: "system" },
          { content: input, role: "user" }
        ],
        model: "gpt-4o"
      });

      return response.choices[0].message.content!;
    }
  }

  async generate(
    provider: "deepseek" | "openai",
    systemPrompt: string,
    userInput: string,
    stream: boolean = false
  ): Promise<ReadableStream<any> | string> {
    console.log("Generating with provider:", provider);
    switch(provider) {
      case "deepseek":
        return this.generateDeepSeek(systemPrompt, userInput, stream);
      case "openai":
        return this.generateOpenAI(systemPrompt, userInput, stream);
      default:
        return this.generateOpenAI(systemPrompt, userInput, stream);
    }
  }
}