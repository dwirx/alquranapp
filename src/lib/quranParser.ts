import { LLMProcessor } from "quran-validator";
import { QuranReference } from "@/types/chat";

const processor = new LLMProcessor({
  autoCorrect: true,
  scanUntagged: true,
  tagFormat: "xml",
});

// Parse quran tags from AI response and validate
export function parseAndValidateQuranRefs(text: string): {
  cleanText: string;
  refs: QuranReference[];
  warnings: string[];
} {
  const result = processor.process(text);

  const refs: QuranReference[] = result.quotes.map((quote) => ({
    surah: parseInt(quote.reference?.split(":")[0] || "0"),
    ayat: quote.reference?.split(":")[1] || "",
    arabic: quote.original || "",
    isValid: quote.isValid,
  }));

  return {
    cleanText: result.correctedText,
    refs,
    warnings: result.warnings,
  };
}

// Regex-based parser for rendering (simpler, for UI)
export function extractQuranTags(text: string): {
  segments: ContentSegment[];
} {
  const regex = /<quran\s+ref="(\d+):(\d+(?:-\d+)?)">([\s\S]*?)<\/quran>/g;
  const segments: ContentSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }

    // Add the quran reference
    segments.push({
      type: "quran",
      content: match[3],
      surah: parseInt(match[1]),
      ayat: match[2],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return { segments };
}

export interface ContentSegment {
  type: "text" | "quran";
  content: string;
  surah?: number;
  ayat?: string;
}

// Clean thinking tags if present
export function extractThinking(text: string): {
  thinking: string;
  content: string;
} {
  const thinkingMatch = text.match(/<think>([\s\S]*?)<\/think>/);
  if (thinkingMatch) {
    return {
      thinking: thinkingMatch[1].trim(),
      content: text.replace(/<think>[\s\S]*?<\/think>/, "").trim(),
    };
  }
  return { thinking: "", content: text };
}
