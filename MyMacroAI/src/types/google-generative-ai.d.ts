declare module '@google/generative-ai' {
  interface GenerationConfig {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  }

  interface SafetySetting {
    category: HarmCategory;
    threshold: HarmBlockThreshold;
  }

  enum HarmCategory {
    HARM_CATEGORY_HARASSMENT = 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_HATE_SPEECH = 'HARM_CATEGORY_HATE_SPEECH',
    HARM_CATEGORY_SEXUALLY_EXPLICIT = 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    HARM_CATEGORY_DANGEROUS_CONTENT = 'HARM_CATEGORY_DANGEROUS_CONTENT'
  }

  enum HarmBlockThreshold {
    BLOCK_LOW_AND_ABOVE = 'BLOCK_LOW_AND_ABOVE',
    BLOCK_MEDIUM_AND_ABOVE = 'BLOCK_MEDIUM_AND_ABOVE',
    BLOCK_ONLY_HIGH = 'BLOCK_ONLY_HIGH',
    BLOCK_NONE = 'BLOCK_NONE'
  }

  interface ModelParams {
    model: string;
    generationConfig?: GenerationConfig;
    safetySettings?: SafetySetting[];
  }

  class GoogleGenerativeAI {
    constructor(apiKey: string);
    
    getGenerativeModel(params: ModelParams): GenerativeModel;
  }

  class GenerativeModel {
    generateContent(
      request: GenerateContentRequest | string | Array<string | Part>
    ): Promise<GenerateContentResponse>;
  }

  type Part = TextPart | InlineDataPart;

  interface TextPart {
    text: string;
  }

  interface InlineDataPart {
    inlineData: {
      data: string;
      mimeType: string;
    };
  }

  interface Content {
    parts: Part[];
    role?: 'user' | 'model';
  }

  interface GenerateContentRequest {
    contents: Content[];
  }

  interface GenerateContentResponse {
    response: GenerateContentResult;
  }

  interface GenerateContentResult {
    text(): string;
  }

  export {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold
  };
}
