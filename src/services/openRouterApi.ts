import { AIModel } from "@/lib/chatDB";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Default model
export const DEFAULT_MODEL = "openai/gpt-4.1-mini";

// Fallback models when API fails
export const FALLBACK_MODELS: AIModel[] = [
  {
    id: "openai/gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    description: "Fast and efficient model from OpenAI",
    pricing: { prompt: 0, completion: 0 },
    context_length: 128000,
    isFree: true,
  },
  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash",
    description: "Google's fast multimodal model",
    pricing: { prompt: 0, completion: 0 },
    context_length: 1000000,
    isFree: true,
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B",
    description: "Meta's open source model",
    pricing: { prompt: 0, completion: 0 },
    context_length: 131072,
    isFree: true,
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    description: "Anthropic's balanced model",
    pricing: { prompt: 0.003, completion: 0.015 },
    context_length: 200000,
    isFree: false,
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    description: "OpenAI's flagship model",
    pricing: { prompt: 0.0025, completion: 0.01 },
    context_length: 128000,
    isFree: false,
  },
];

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  created?: number; // Unix timestamp when model was added
}

interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

// Fetch all models from OpenRouter
export async function fetchModels(): Promise<AIModel[]> {
  try {
    const response = await fetch(`${OPENROUTER_API_URL}/models`, {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Al-Quran App",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data: OpenRouterModelsResponse = await response.json();

    // Transform and filter models
    const models: AIModel[] = data.data
      .map((model) => {
        const promptPrice = parseFloat(model.pricing.prompt) || 0;
        const completionPrice = parseFloat(model.pricing.completion) || 0;

        return {
          id: model.id,
          name: formatModelName(model.name || model.id),
          description: model.description,
          pricing: {
            prompt: promptPrice,
            completion: completionPrice,
          },
          context_length: model.context_length || 4096,
          isFree: promptPrice === 0 && completionPrice === 0,
          created: model.created || 0,
        };
      })
      // Sort: free first, then by name
      .sort((a, b) => {
        if (a.isFree !== b.isFree) return a.isFree ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    console.log("[OpenRouter] Fetched", models.length, "models");
    return models;
  } catch (error) {
    console.error("[OpenRouter] Failed to fetch models:", error);
    return FALLBACK_MODELS;
  }
}

// Format model name for display
function formatModelName(name: string): string {
  // Remove provider prefix if present in name
  return name
    .replace(/^(openai|anthropic|google|meta-llama|mistral|deepseek)\//i, "")
    .replace(/:free$/i, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Format price for display
export function formatPrice(price: number): string {
  if (price === 0) return "Free";
  if (price < 0.001) return `$${(price * 1000).toFixed(3)}/1K`;
  return `$${price.toFixed(4)}/1K`;
}
