import OpenAI from "openai";

export class ModelRouter {
  private openai = new OpenAI();
  private deepseek = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY,
  })
  
  async generate(
    provider: "openai" | "deepseek",
    systemPrompt: string,
    userInput: string,
    stream: boolean = false
  ): Promise<string | ReadableStream<any>> {
    console.log("Generating with provider:", provider);
    console.log("User input:", userInput);
    switch(provider) {
      case "openai":
        return this.generateOpenAI(systemPrompt, userInput, stream);
      case "deepseek":
        return this.generateDeepSeek(systemPrompt, userInput, stream);
      default:
        return this.generateOpenAI(systemPrompt, userInput, stream);
    }
  }

  private async generateOpenAI(system: string, input: string, stream: boolean = false) {
    console.log("Generating with OpenAI");

    if (stream) {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        stream: stream,
        messages: [
          { role: "system", content: system },
          { role: "user", content: input }
        ]
      });

      return response.toReadableStream();
    } else {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: system },
          { role: "user", content: input }
        ]
      });

      return response.choices[0].message.content!;
    }
  }

  private async generateDeepSeek(system: string, input: string, stream: boolean = false) {
    console.log("Generating with DeepSeek");
    if (stream) {
      const response = await this.deepseek.chat.completions.create({
        model: "deepseek-reasoner",
        stream: stream,
        messages: [
        { role: "system", content: system },
        { role: "user", content: input }
      ]
    });
      return response.toReadableStream();
    } else {
      const response = await this.deepseek.chat.completions.create({
        model: "deepseek-reasoner",
        messages: [
          { role: "system", content: system },
          { role: "user", content: input }
        ]
      });

      return response.choices[0].message.content!;
    }
  }
}