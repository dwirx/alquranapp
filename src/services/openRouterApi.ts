import { AIModel } from "@/lib/chatDB";
import { ChatApiConfig } from "@/types/chat";

export function normalizeOpenRouterBaseURL(baseURL: string): string {
  let cleaned = baseURL.trim().replace(/\/+$/, "");
  cleaned = cleaned
    .replace(/\/chat\/completions?$/i, "")
    .replace(/\/chat\/completion$/i, "")
    .replace(/\/completions?$/i, "")
    .replace(/\/completion$/i, "")
    .replace(/\/models$/i, "");
  return cleaned;
}

export const DEFAULT_OPENROUTER_BASE_URL = normalizeOpenRouterBaseURL(
  import.meta.env.VITE_OPENROUTER_API_URL || "https://openrouter.ai/api/v1"
);
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";

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

function normalizeModelsEndpoint(baseURL: string): string {
  const cleaned = normalizeOpenRouterBaseURL(baseURL);
  return `${cleaned}/models`;
}

// Fetch all models from OpenRouter
export async function fetchModels(config?: ChatApiConfig): Promise<AIModel[]> {
  try {
    const endpoint = normalizeModelsEndpoint(config?.baseURL || DEFAULT_OPENROUTER_BASE_URL);
    const apiKey = config?.apiKey || OPENROUTER_API_KEY;
    const referer = config?.referer || window.location.origin;
    const siteTitle = config?.siteTitle || "Al-Quran App";

    if (!apiKey) {
      throw new Error("API key belum diatur");
    }

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": referer,
        "X-Title": siteTitle,
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
