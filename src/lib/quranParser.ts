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

export type SegmentType = "text" | "quran" | "shalat" | "doa" | "imsakiyah";

export interface ContentSegment {
  type: SegmentType;
  content: string;
  surah?: number;
  ayat?: string;
  query?: string; // for doa search
  provinsi?: string; // for shalat/imsakiyah
  kabkota?: string; // for shalat/imsakiyah
}

// Regex-based parser for rendering (handles all custom tags)
export function extractQuranTags(text: string): {
  segments: ContentSegment[];
} {
  // Find all matches with their positions
  interface TagMatch {
    type: SegmentType;
    index: number;
    length: number;
    surah?: number;
    ayat?: string;
    content?: string;
    query?: string;
    provinsi?: string;
    kabkota?: string;
  }

  const matches: TagMatch[] = [];

  // Find quran tags
  const quranRegex = /<quran\s+ref="(\d+):(\d+(?:-\d+)?)">([\s\S]*?)<\/quran>/g;
  let match: RegExpExecArray | null;
  while ((match = quranRegex.exec(text)) !== null) {
    matches.push({
      type: "quran",
      index: match.index,
      length: match[0].length,
      surah: parseInt(match[1]),
      ayat: match[2],
      content: match[3],
    });
  }

  // Find shalat tags with optional provinsi and kabkota attributes
  // Supports: <shalat/>, <shalat kabkota="X"/>, <shalat provinsi="X" kabkota="Y"/>
  const shalatRegex = /<shalat(?:\s+(?:provinsi="([^"]*)")?(?:\s*kabkota="([^"]*)")?|\s+kabkota="([^"]*)")?\s*\/>/g;
  while ((match = shalatRegex.exec(text)) !== null) {
    matches.push({
      type: "shalat",
      index: match.index,
      length: match[0].length,
      provinsi: match[1] || undefined,
      kabkota: match[2] || match[3] || undefined,
    });
  }

  // Find doa tags
  const doaRegex = /<doa\s+query="([^"]+)"\s*\/>/g;
  while ((match = doaRegex.exec(text)) !== null) {
    matches.push({
      type: "doa",
      index: match.index,
      length: match[0].length,
      query: match[1],
    });
  }

  // Find imsakiyah tags with optional provinsi and kabkota attributes
  const imsakiyahRegex = /<imsakiyah(?:\s+(?:provinsi="([^"]*)")?(?:\s*kabkota="([^"]*)")?|\s+kabkota="([^"]*)")?\s*\/>/g;
  while ((match = imsakiyahRegex.exec(text)) !== null) {
    matches.push({
      type: "imsakiyah",
      index: match.index,
      length: match[0].length,
      provinsi: match[1] || undefined,
      kabkota: match[2] || match[3] || undefined,
    });
  }

  // Sort by position
  matches.sort((a, b) => a.index - b.index);

  // Build segments
  const segments: ContentSegment[] = [];
  let lastIndex = 0;

  for (const m of matches) {
    // Add text before the match
    if (m.index > lastIndex) {
      const textContent = text.slice(lastIndex, m.index);
      if (textContent.trim()) {
        segments.push({
          type: "text",
          content: textContent,
        });
      }
    }

    // Add the matched segment
    if (m.type === "quran") {
      segments.push({
        type: "quran",
        content: m.content || "",
        surah: m.surah,
        ayat: m.ayat,
      });
    } else if (m.type === "shalat") {
      segments.push({
        type: "shalat",
        content: "",
        provinsi: m.provinsi,
        kabkota: m.kabkota,
      });
    } else if (m.type === "doa") {
      segments.push({
        type: "doa",
        content: "",
        query: m.query,
      });
    } else if (m.type === "imsakiyah") {
      segments.push({
        type: "imsakiyah",
        content: "",
        provinsi: m.provinsi,
        kabkota: m.kabkota,
      });
    }

    lastIndex = m.index + m.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const textContent = text.slice(lastIndex);
    if (textContent.trim()) {
      segments.push({
        type: "text",
        content: textContent,
      });
    }
  }

  // If no segments found, return the whole text
  if (segments.length === 0) {
    segments.push({
      type: "text",
      content: text,
    });
  }

  return { segments };
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
