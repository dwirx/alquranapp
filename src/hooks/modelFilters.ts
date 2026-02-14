import { AIModel } from "@/lib/chatDB";

function hasZeroPrice(model: AIModel): boolean {
  return model.pricing.prompt === 0 && model.pricing.completion === 0;
}

export function filterFreeOrZeroPriceModels(models: AIModel[]): AIModel[] {
  return models.filter((model) => model.isFree || hasZeroPrice(model));
}
