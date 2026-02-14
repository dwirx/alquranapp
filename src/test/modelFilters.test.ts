import { describe, expect, it } from "vitest";
import { AIModel } from "@/lib/chatDB";
import { filterFreeOrZeroPriceModels } from "@/hooks/modelFilters";

const makeModel = (overrides: Partial<AIModel>): AIModel => ({
  id: "test/model",
  name: "Test Model",
  description: "",
  pricing: {
    prompt: 0,
    completion: 0,
  },
  context_length: 8192,
  isFree: true,
  created: 0,
  ...overrides,
});

describe("filterFreeOrZeroPriceModels", () => {
  it("keeps only models that are free or have zero price", () => {
    const models: AIModel[] = [
      makeModel({ id: "free-flag", isFree: true, pricing: { prompt: 0.001, completion: 0.001 } }),
      makeModel({ id: "zero-both", isFree: false, pricing: { prompt: 0, completion: 0 } }),
      makeModel({ id: "paid", isFree: false, pricing: { prompt: 0.001, completion: 0.002 } }),
    ];

    const filtered = filterFreeOrZeroPriceModels(models);

    expect(filtered.map((m) => m.id)).toEqual(["free-flag", "zero-both"]);
  });
});
