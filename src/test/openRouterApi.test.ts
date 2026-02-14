import { describe, expect, it } from "vitest";
import { normalizeOpenRouterBaseURL } from "@/services/openRouterApi";

describe("normalizeOpenRouterBaseURL", () => {
  it("normalizes chat completion endpoints to base api url", () => {
    expect(normalizeOpenRouterBaseURL("https://openrouter.ai/api/v1/chat/completions"))
      .toBe("https://openrouter.ai/api/v1");
    expect(normalizeOpenRouterBaseURL("https://openrouter.ai/api/v1/chat/completion"))
      .toBe("https://openrouter.ai/api/v1");
  });

  it("normalizes models endpoint to base api url", () => {
    expect(normalizeOpenRouterBaseURL("https://openrouter.ai/api/v1/models"))
      .toBe("https://openrouter.ai/api/v1");
  });
});
