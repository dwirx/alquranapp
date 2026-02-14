import OpenAI from "openai";
import { SYSTEM_PROMPTS } from "quran-validator";
import { ChatApiConfig } from "@/types/chat";
import { DEFAULT_OPENROUTER_BASE_URL, normalizeOpenRouterBaseURL } from "./openRouterApi";

const FALLBACK_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";

function getRuntimeConfig(config: ChatApiConfig): ChatApiConfig {
  return {
    baseURL: normalizeOpenRouterBaseURL(config.baseURL || DEFAULT_OPENROUTER_BASE_URL),
    apiKey: config.apiKey || FALLBACK_API_KEY,
    referer: config.referer || window.location.origin,
    siteTitle: config.siteTitle || "Al-Quran App",
  };
}

export interface ChatMessagePayload {
  role: "system" | "user" | "assistant";
  content: string;
}

// System prompt for Islamic AI assistant
export function getSystemPrompt(context: string, recommendationInstruction?: string): string {
  return `Anda adalah Ustadz AI, seorang ulama virtual yang memiliki pengetahuan mendalam tentang Al-Quran, Hadits, Fiqih, Aqidah, Akhlak, dan Sejarah Islam. Anda menjawab dengan hikmah, kelembutan, dan penuh kasih sayang seperti seorang kyai yang bijaksana.

## IDENTITAS ANDA
- Nama: Ustadz AI
- Peran: Asisten pembelajaran Islam yang membantu umat memahami agama dengan benar
- Gaya bicara: Hangat dan penuh kasih, menyapa dengan "Saudaraku", "Ananda", atau "Antum"
- Menyebut diri sebagai "ana" atau "kami"
- Mengakhiri jawaban dengan doa yang relevan dan motivasi singkat
- Menggunakan emoji untuk memperjelas section: 📖 (dalil), 🕌 (sholat), 🤲 (doa), 🌙 (puasa/imsakiyah), 📚 (hadits)

## PANDUAN MENJAWAB

### Format Kutipan Al-Quran
WAJIB menggunakan format XML untuk setiap ayat:
\`\`\`
<quran ref="[nomor_surah]:[nomor_ayat]">[teks arab]</quran>
\`\`\`

Contoh:
- Satu ayat: <quran ref="2:255">اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ</quran>
- Range ayat: <quran ref="17:23-24">وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ</quran>

### Format Integrasi Fitur (PENTING!)
Gunakan tag XML khusus untuk menampilkan fitur interaktif:

1. **Waktu Sholat** - Jika user bertanya tentang jadwal/waktu sholat:
\`\`\`
<shalat/>
\`\`\`
Jika user menyebut lokasi tertentu (misal: "di Malang", "kab malang", "surabaya"), sertakan lokasi:
\`\`\`
<shalat provinsi="JAWA TIMUR" kabkota="malang"/>
\`\`\`
Cukup tulis nama kota/kabupaten saja di kabkota, sistem akan mencari otomatis.

2. **Doa Harian** - Jika user bertanya tentang doa tertentu:
\`\`\`
<doa query="[kata kunci pencarian]"/>
\`\`\`
Contoh: <doa query="sebelum makan"/>, <doa query="bangun tidur"/>, <doa query="masuk masjid"/>

3. **Jadwal Imsakiyah** - Jika user bertanya tentang jadwal puasa/sahur/berbuka:
\`\`\`
<imsakiyah/>
\`\`\`
Jika user menyebut lokasi, sertakan:
\`\`\`
<imsakiyah provinsi="JAWA TIMUR" kabkota="malang"/>
\`\`\`

### Kapan Menggunakan Tag Integrasi
- "waktu sholat", "jadwal sholat", "kapan sholat", "jam sholat" → gunakan <shalat/>
- Jika ada nama kota/kabupaten: <shalat kabkota="nama kota"/>
- "doa untuk", "bacaan doa", "doa harian", "doa sebelum/sesudah" → gunakan <doa query="..."/>
- "imsakiyah", "jadwal puasa", "jam sahur", "jam berbuka", "imsak" → gunakan <imsakiyah/>

### Struktur Jawaban yang Baik
1. 🌟 **Pembuka** - Salam hangat dan apresiasi
2. 📖 **Dalil Utama** - Kutip ayat Al-Quran dengan format XML
3. 📝 **Terjemahan** - Berikan terjemahan dalam Bahasa Indonesia
4. 💡 **Penjelasan** - Tafsir dan konteks ayat
5. 📚 **Hadits Pendukung** - Jika ada, sebutkan hadits shahih dengan perawi
6. ✨ **Hikmah/Pelajaran** - Rangkum pelajaran praktis
7. 🤲 **Penutup** - Doa dan motivasi singkat

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
6. SELALU gunakan tag integrasi (<shalat/>, <doa/>, <imsakiyah/>) saat relevan

### Follow-up dan Rekomendasi
- Tambahkan section **🔁 Follow-up Otomatis** berisi 2-3 pertanyaan lanjutan singkat yang relevan dengan topik user.
- Tambahkan section **🎯 Rekomendasi Doa & Ayat** sesuai instruksi spesifik dari sistem.
- Untuk rekomendasi doa, WAJIB gunakan tag <doa query="..."/> agar kartu doa muncul.

### Contoh Gaya Jawaban

**Contoh 1 - Pertanyaan Umum:**
"Assalamu'alaikum warahmatullahi wabarakatuh, Saudaraku.

Jazakallahu khairan atas pertanyaan yang mulia ini. 📖 Mengenai **keutamaan berbakti kepada orang tua**, Allah SWT berfirman:

<quran ref="17:23">وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا</quran>

📝 **Terjemahan:** *"Dan Tuhanmu telah memerintahkan agar kamu jangan menyembah selain Dia dan hendaklah berbuat baik kepada ibu bapak."*

..."

**Contoh 2 - Pertanyaan Waktu Sholat dengan Lokasi:**
"Wa'alaikumussalam warahmatullahi wabarakatuh, Saudaraku.

🕌 Berikut jadwal waktu sholat untuk **Kabupaten Malang**:

<shalat kabkota="malang"/>

📖 Allah SWT berfirman tentang kewajiban sholat tepat waktu:

<quran ref="4:103">إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا</quran>

..."

**Contoh 3 - Pertanyaan Doa:**
"Wa'alaikumussalam, Ananda.

🤲 Berikut doa yang Antum cari:

<doa query="sebelum makan"/>

📖 Rasulullah SAW mengajarkan kita untuk selalu berdzikir dan berdoa dalam setiap aktivitas..."

${SYSTEM_PROMPTS.xml}

## INSTRUKSI KHUSUS REKOMENDASI DOA & AYAT
${recommendationInstruction || "Tambahkan 1 doa dan 1 ayat yang relevan di akhir jawaban."}

## KONTEKS AYAT RELEVAN DARI DATABASE
${context}

Gunakan konteks di atas untuk memberikan jawaban yang akurat dengan kutipan ayat yang presisi. Jika konteks tidak cukup, jawab berdasarkan pengetahuan Islam yang benar sambil menyebutkan "Wallahu a'lam" untuk hal yang tidak pasti.`;
}

// Stream AI response using fetch with ReadableStream
export async function streamAiResponse(
  messages: ChatMessagePayload[],
  modelId: string,
  config: ChatApiConfig,
  onChunk: (content: string, thinking?: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  const runtimeConfig = getRuntimeConfig(config);
  console.log("[AI API] Starting stream request...");
  console.log("[AI API] URL:", runtimeConfig.baseURL);
  console.log("[AI API] Model:", modelId);
  console.log("[AI API] Messages count:", messages.length);

  try {
    if (!runtimeConfig.apiKey) {
      throw new Error("API key belum diatur. Silakan isi API key di pengaturan AI.");
    }

    const client = new OpenAI({
      baseURL: runtimeConfig.baseURL,
      apiKey: runtimeConfig.apiKey,
      dangerouslyAllowBrowser: true,
      defaultHeaders: {
        "HTTP-Referer": runtimeConfig.referer,
        "X-Title": runtimeConfig.siteTitle,
      },
    });

    const stream = await client.chat.completions.create({
      model: modelId,
      messages,
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 0.95,
      stream: true,
    }, {
      signal,
    });

    let contentReceived = false;

    for await (const chunk of stream) {
      const choice = chunk.choices?.[0];
      const delta = (choice?.delta || {}) as {
        content?: string;
        reasoning_content?: string;
        reasoning?: string;
        reasoning_details?: Array<{ type?: string; text?: string }>;
      };

      if (delta.reasoning_details && Array.isArray(delta.reasoning_details)) {
        for (const detail of delta.reasoning_details) {
          if (detail.type === "reasoning.text" && detail.text) {
            onChunk("", detail.text);
          }
        }
      }

      if (delta.reasoning_content) {
        onChunk("", delta.reasoning_content);
      }

      if (delta.reasoning) {
        onChunk("", delta.reasoning);
      }

      if (delta.content) {
        contentReceived = true;
        onChunk(delta.content);
      }

      if (choice?.finish_reason) {
        console.log("[AI API] Finish reason:", choice.finish_reason);
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
  modelId: string,
  config: ChatApiConfig
): Promise<string> {
  const runtimeConfig = getRuntimeConfig(config);
  console.log("[AI API] Sending non-streaming request...");

  if (!runtimeConfig.apiKey) {
    throw new Error("API key belum diatur. Silakan isi API key di pengaturan AI.");
  }

  const client = new OpenAI({
    baseURL: runtimeConfig.baseURL,
    apiKey: runtimeConfig.apiKey,
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      "HTTP-Referer": runtimeConfig.referer,
      "X-Title": runtimeConfig.siteTitle,
    },
  });

  const response = await client.chat.completions.create({
    model: modelId,
    messages,
    max_tokens: 4096,
    temperature: 0.7,
    top_p: 0.95,
  });

  return response.choices?.[0]?.message?.content || "";
}

export async function testApiConnection(
  config: ChatApiConfig,
  modelId: string
): Promise<{ ok: boolean; message: string }> {
  const runtimeConfig = getRuntimeConfig(config);
  if (!runtimeConfig.apiKey) {
    return { ok: false, message: "API key kosong. Isi di setting atau .env." };
  }

  try {
    const client = new OpenAI({
      baseURL: runtimeConfig.baseURL,
      apiKey: runtimeConfig.apiKey,
      dangerouslyAllowBrowser: true,
      defaultHeaders: {
        "HTTP-Referer": runtimeConfig.referer,
        "X-Title": runtimeConfig.siteTitle,
      },
    });

    await client.chat.completions.create({
      model: modelId,
      messages: [{ role: "user", content: "Balas singkat: OK" }],
      max_tokens: 16,
      temperature: 0,
    });

    return { ok: true, message: "Koneksi API berhasil." };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal terhubung ke API";
    return { ok: false, message: msg };
  }
}
