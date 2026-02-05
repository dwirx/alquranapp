import { SYSTEM_PROMPTS } from "quran-validator";

// OpenRouter API configuration
const OPENROUTER_API_URL = import.meta.env.VITE_OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export interface ChatMessagePayload {
  role: "system" | "user" | "assistant";
  content: string;
}

// System prompt for Islamic AI assistant
export function getSystemPrompt(context: string): string {
  return `Anda adalah Ustadz AI, seorang ulama virtual yang memiliki pengetahuan mendalam tentang Al-Quran, Hadits, Fiqih, Aqidah, Akhlak, dan Sejarah Islam. Anda menjawab dengan hikmah, kelembutan, dan penuh kasih sayang seperti seorang kyai yang bijaksana.

## IDENTITAS ANDA
- Nama: Ustadz AI
- Peran: Asisten pembelajaran Islam yang membantu umat memahami agama dengan benar
- Gaya bicara: Sopan, lembut, menggunakan "Bapak/Ibu", "Saudara/i", dan menyebut diri sebagai "ana" atau "kami"
- Mengakhiri jawaban dengan doa atau nasihat yang relevan

## PANDUAN MENJAWAB

### Format Kutipan Al-Quran
WAJIB menggunakan format XML untuk setiap ayat:
\`\`\`
<quran ref="[nomor_surah]:[nomor_ayat]">[teks arab]</quran>
\`\`\`

Contoh:
- Satu ayat: <quran ref="2:255">اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ</quran>
- Range ayat: <quran ref="17:23-24">وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ</quran>

### Struktur Jawaban yang Baik
1. **Pembuka** - Salam dan apresiasi atas pertanyaan
2. **Dalil Utama** - Kutip ayat Al-Quran yang paling relevan dengan format XML
3. **Terjemahan** - Berikan terjemahan ayat dalam Bahasa Indonesia
4. **Penjelasan** - Tafsir dan konteks ayat
5. **Hadits Pendukung** - Jika ada, sebutkan hadits shahih dengan perawi
6. **Hikmah/Pelajaran** - Rangkum pelajaran praktis untuk kehidupan
7. **Penutup** - Doa atau nasihat singkat

### Aturan Penting
1. SELALU kutip ayat dengan nomor surah dan ayat yang PRESISI
2. Jangan mengarang ayat atau hadits - jika tidak yakin, katakan "Wallahu a'lam"
3. Untuk hadits, sebutkan perawi (HR. Bukhari, Muslim, dll)
4. Gunakan format markdown untuk struktur yang rapi:
   - **bold** untuk kata penting
   - *italic* untuk istilah Arab
   - > untuk blockquote
   - - untuk daftar poin
5. Jika pertanyaan di luar kapasitas atau tidak islami, tolak dengan sopan

### Contoh Gaya Jawaban
"Assalamu'alaikum warahmatullahi wabarakatuh.

Jazakallahu khairan atas pertanyaan yang sangat baik ini, Saudara/i. Mengenai **keutamaan berbakti kepada orang tua**, Allah SWT berfirman dalam Al-Quran:

<quran ref="17:23">وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا</quran>

**Terjemahan:** *"Dan Tuhanmu telah memerintahkan agar kamu jangan menyembah selain Dia dan hendaklah berbuat baik kepada ibu bapak."*

..."

${SYSTEM_PROMPTS.xml}

## KONTEKS AYAT RELEVAN DARI DATABASE
${context}

Gunakan konteks di atas untuk memberikan jawaban yang akurat dengan kutipan ayat yang presisi. Jika konteks tidak cukup, jawab berdasarkan pengetahuan Islam yang benar sambil menyebutkan "Wallahu a'lam" untuk hal yang tidak pasti.`;
}

// Stream AI response using fetch with ReadableStream
export async function streamAiResponse(
  messages: ChatMessagePayload[],
  modelId: string,
  onChunk: (content: string, thinking?: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  console.log("[AI API] Starting stream request...");
  console.log("[AI API] URL:", OPENROUTER_API_URL);
  console.log("[AI API] Model:", modelId);
  console.log("[AI API] Messages count:", messages.length);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Al-Quran App",
      },
      body: JSON.stringify({
        model: modelId,
        messages: messages,
        max_tokens: 4096,
        temperature: 0.7,
        top_p: 0.95,
        stream: true,
      }),
      signal,
    });

    console.log("[AI API] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI API] Error response:", errorText);
      throw new Error(`API error ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body from API");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let chunkCount = 0;
    let contentReceived = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("[AI API] Stream ended, total chunks:", chunkCount);
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            console.log("[AI API] Received [DONE] signal");
            onComplete();
            return;
          }

          // Skip empty data
          if (!data) continue;

          try {
            const parsed = JSON.parse(data);
            console.debug("[AI API] Parsed chunk:", JSON.stringify(parsed).substring(0, 200));

            const choice = parsed.choices?.[0];
            const delta = choice?.delta;
            const message = choice?.message;

            if (delta) {
              chunkCount++;

              // Handle reasoning_details array (OpenRouter format for reasoning models)
              if (delta.reasoning_details && Array.isArray(delta.reasoning_details)) {
                for (const detail of delta.reasoning_details) {
                  if (detail.type === "reasoning.text" && detail.text) {
                    onChunk("", detail.text);
                  }
                }
              }

              // Handle reasoning_content (alternative field name)
              if (delta.reasoning_content) {
                onChunk("", delta.reasoning_content);
              }

              // Handle reasoning field (some models use this)
              if (delta.reasoning) {
                onChunk("", delta.reasoning);
              }

              // Handle actual content
              if (delta.content) {
                contentReceived = true;
                onChunk(delta.content);
              }
            } else if (message?.content) {
              // Non-streaming format in stream (some models do this)
              contentReceived = true;
              onChunk(message.content);
            }

            // Check if finished
            if (choice?.finish_reason) {
              console.log("[AI API] Finish reason:", choice.finish_reason);
            }
          } catch (parseError) {
            // Skip invalid JSON lines
            console.debug("[AI API] Skipping invalid JSON:", data.substring(0, 100));
          }
        } else if (line.trim() && !line.startsWith(":")) {
          // Log non-data lines for debugging
          console.debug("[AI API] Non-data line:", line.substring(0, 100));
        }
      }
    }

    if (!contentReceived) {
      console.warn("[AI API] No content received");
      onChunk("\n\n(AI sedang memproses, coba lagi jika tidak ada respons)");
    }

    onComplete();
  } catch (error) {
    console.error("[AI API] Stream error:", error);
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

// Non-streaming version for simpler use cases
export async function sendAiMessage(
  messages: ChatMessagePayload[],
  modelId: string
): Promise<string> {
  console.log("[AI API] Sending non-streaming request...");

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "Al-Quran App",
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages,
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 0.95,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("[AI API] Response received:", data.choices?.[0]?.finish_reason);

  return data.choices?.[0]?.message?.content || "";
}
