import { describe, expect, it } from "vitest";
import { buildDoaAyatRecommendationInstruction, generateAutoFollowUps } from "@/lib/chatEnhancements";

describe("chatEnhancements", () => {
  it("builds topic-specific doa recommendation for anxiety-related questions", () => {
    const instruction = buildDoaAyatRecommendationInstruction("Saya sedang cemas dan takut berlebihan");

    expect(instruction).toContain("Topik terdeteksi: anxiety.");
    expect(instruction).toContain('<doa query="ketenangan hati"/>');
  });

  it("returns topic-based follow-up suggestions", () => {
    const followUps = generateAutoFollowUps("Bagaimana Islam membahas hutang dan rezeki?");

    expect(followUps).toHaveLength(3);
    expect(followUps[0]).toContain("rezeki");
  });
});
