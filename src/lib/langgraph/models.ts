import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import OpenAI from "openai";

import { CustomStreamController } from "@/utils/custom-stream";

// Export the interface
export interface LLMGenerationResult {
  output: string;
  usage: {
    inputTokens: number;
    modelName: string; // The specific model used for this call
    outputTokens: number;
  } | null;
}

type StreamTarget = 'partialResult' | 'reasoning'; // Define the type for clarity

export class ModelRouter {
  private deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  })
  private google = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  private openai = new OpenAI();

  private async generateDeepSeek(
    system: string,
    input: string,
    streamController?: CustomStreamController,
    streamTarget?: StreamTarget // Added streamTarget
  ) {
    if (streamController && streamTarget) { // Check for streamController AND streamTarget
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
        // DeepSeek has a specific reasoning field, but let's standardize:
        // Stream the main content to the specified target.
        const content = chunk.choices[0]?.delta?.content || '';
        // const reasoning = chunk.choices[0]?.delta?.["reasoning_content"] || ''; // We might ignore this specific field now

        if (content) {
          accumulatedContent += content;
          if (streamTarget === 'reasoning') {
            streamController.writeReasoning(content, "deepseek");
          } else { // 'partialResult'
            streamController.writePartialResult(content);
          }
        }
        // Optionally handle the 'reasoning_content' if needed specifically for DeepSeek in reasoning mode
        // if (streamTarget === 'reasoning' && reasoning) {
        //   streamController.writeReasoning(reasoning, "deepseek-reasoning-field");
        // }
      }
      return accumulatedContent;
    } else { // Handle non-streaming case or when streamTarget is not provided
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
  
  private async generateGoogle(
    system: string,
    input: string,
    model: string,
    streamController?: CustomStreamController,
    streamTarget?: StreamTarget // Added streamTarget
  ) {
    const genAI = this.google.getGenerativeModel({
      model: model,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
      systemInstruction: system,
    });

    if (streamController && streamTarget) { // Check for streamController AND streamTarget
      const result = await genAI.generateContentStream(input);
      let accumulatedContent = '';
      for await (const chunk of result.stream) {
        // Ensure errors are handled or reported if needed from chunk.error
        try {
            const content = chunk.text();
            if (content) {
              accumulatedContent += content;
              if (streamTarget === 'reasoning') {
                streamController.writeReasoning(content, "google");
              } else { // 'partialResult'
                streamController.writePartialResult(content);
              }
            }
        } catch (e) {
             console.error("Error processing Google stream chunk:", e);
             streamController.writeSystemMessage("Error processing part of the response.");
        }
      }
      return accumulatedContent;

    } else { // Handle non-streaming case or when streamTarget is not provided
      const result = await genAI.generateContent(input);
      const response = result.response;
       try {
           return response.text();
       } catch (e) {
           console.error("Error extracting text from Google non-streaming response:", e);
           // Attempt to provide more info if available
           const candidate = response.candidates?.[0];
           const finishReason = candidate?.finishReason;
           const safetyRatings = candidate?.safetyRatings;
           console.error("Finish Reason:", finishReason);
           console.error("Safety Ratings:", safetyRatings);
            if (streamController) { // Also notify user if possible
                 streamController.writeSystemMessage(`Error: Could not generate response. Finish Reason: ${finishReason}`);
            }
           throw new Error(`Failed to get text from Google response. Finish Reason: ${finishReason}`);
       }
    }
  }

  private async generateOpenAI(
    system: string,
    input: string,
    model: string,
    streamController?: CustomStreamController,
    streamTarget?: StreamTarget // Added streamTarget
  ) {
    if (streamController && streamTarget) { // Check for streamController AND streamTarget
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
           if (streamTarget === 'reasoning') {
             streamController.writeReasoning(content, "openai");
           } else { // 'partialResult'
             streamController.writePartialResult(content);
           }
        }
      }
      return accumulatedContent;
    } else { // Handle non-streaming case or when streamTarget is not provided
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

  private getProviderAndModel(selectedModel: string): { model: string; provider: "deepseek" | "google" | "openai", } {
    const lowerCaseModel = selectedModel.toLowerCase();

    if (lowerCaseModel.includes("open ai")) {
      // Map OpenAI models
      const modelMap = {
        "Open AI 4o": "gpt-4o",
        "Open AI 4o-mini": "gpt-4o-mini",
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
        "Google Gemini 1.5 Flash": "gemini-1.5-flash-latest",
        "Google Gemini 1.5 Pro": "gemini-1.5-pro-latest",
        "Google Gemini-2.5-pro-exp-03-25": "gemini-2.5-pro-exp-03-25" // Example mapping
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
    streamController?: CustomStreamController,
    streamTarget?: StreamTarget // Added streamTarget
  ): Promise<LLMGenerationResult> {
    const { model, provider } = this.getProviderAndModel(selectedModel);

    // Determine the effective stream target based on the stream flag
    const effectiveStreamTarget = stream ? streamTarget : undefined;

    let outputText = "";
    let usageInfo: LLMGenerationResult['usage'] = null;

    try {
      let result: string;
      switch (provider) {
        case "deepseek":
          result = await this.generateDeepSeek(systemPrompt, userInput, streamController, effectiveStreamTarget);
          break;
        case "google":
           result = await this.generateGoogle(systemPrompt, userInput, model, streamController, effectiveStreamTarget);
           break;
        case "openai":
          result = await this.generateOpenAI(systemPrompt, userInput, model, streamController, effectiveStreamTarget);
          break;
        default:
           throw new Error(`Unsupported provider: ${provider}`);
      }

      // Add a newline only if streaming to partialResult, not reasoning.
      // Reasoning stream might be followed immediately by partialResult stream.
      if (streamController && effectiveStreamTarget === 'partialResult') {
        streamController.writePartialResult("\n\n");
      }

      outputText = result;
      usageInfo = {
        inputTokens: systemPrompt.length * 2, // Replace with actual token count
        modelName: model, // Use actual model if dynamically chosen
        outputTokens: outputText.length // Replace with actual token count
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Error generating content with ${provider} (${model}):`, error); // Log detailed error
      if (streamController) {
        // Provide a more user-friendly error message
        streamController.writeSystemMessage(`Error during generation with ${selectedModel}. Please check logs or try again.`);
      }
      // Re-throw the original error to be handled by the workflow node
      throw error;
    }

    // Return the structured result
    return {
      output: outputText,
      usage: usageInfo,
    };
  }
}