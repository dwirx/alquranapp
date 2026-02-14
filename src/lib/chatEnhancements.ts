const TOPIC_RULES = [
  {
    id: "anxiety",
    keywords: ["cemas", "gelisah", "takut", "stress", "stres", "sedih", "putus asa", "overthinking"],
    doaQuery: "ketenangan hati",
    ayatRefs: ["13:28", "2:286"],
    followUps: [
      "Bagaimana cara berdzikir saat hati sedang cemas?",
      "Ayat apa yang dibaca ketika merasa takut berlebihan?",
      "Doa pendek agar hati lebih tenang setelah shalat"
    ]
  },
  {
    id: "rizki",
    keywords: ["rezeki", "rezeki", "rizki", "hutang", "utang", "pekerjaan", "usaha", "bisnis"],
    doaQuery: "kelapangan rezeki",
    ayatRefs: ["65:2-3", "51:58"],
    followUps: [
      "Amalan harian agar dimudahkan rezeki halal",
      "Bagaimana adab mencari nafkah menurut Islam?",
      "Doa setelah subuh untuk keberkahan rezeki"
    ]
  },
  {
    id: "family",
    keywords: ["orang tua", "ibu", "ayah", "keluarga", "suami", "istri", "anak", "rumah tangga"],
    doaQuery: "kebaikan keluarga",
    ayatRefs: ["17:23", "25:74"],
    followUps: [
      "Bagaimana cara berbakti pada orang tua saat beda pendapat?",
      "Doa untuk kebaikan pasangan dan anak",
      "Ayat tentang menjaga keharmonisan keluarga"
    ]
  },
  {
    id: "sin",
    keywords: ["dosa", "maksiat", "taubat", "ampunan", "istighfar", "lalai"],
    doaQuery: "taubat dan ampunan",
    ayatRefs: ["39:53", "66:8"],
    followUps: [
      "Langkah taubat nasuha yang benar menurut ulama",
      "Dzikir istighfar yang dianjurkan setelah shalat",
      "Bagaimana menjaga istiqamah setelah bertaubat?"
    ]
  },
  {
    id: "study",
    keywords: ["belajar", "ujian", "ilmu", "hafalan", "fokus", "malas"],
    doaQuery: "kemudahan belajar",
    ayatRefs: ["20:114", "58:11"],
    followUps: [
      "Doa sebelum belajar yang shahih",
      "Tips Islam untuk menjaga semangat menuntut ilmu",
      "Ayat motivasi agar konsisten belajar"
    ]
  }
] as const;

type TopicRule = (typeof TOPIC_RULES)[number];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function detectTopic(question: string): TopicRule | null {
  const normalizedQuestion = normalize(question);
  if (!normalizedQuestion) return null;

  let bestMatch: TopicRule | null = null;
  let bestScore = 0;

  for (const rule of TOPIC_RULES) {
    const score = rule.keywords.reduce((count, keyword) => {
      return normalizedQuestion.includes(keyword) ? count + 1 : count;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = rule;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

export function buildDoaAyatRecommendationInstruction(question: string): string {
  const topic = detectTopic(question);

  if (!topic) {
    return [
      "Tambahkan section **🎯 Rekomendasi Doa & Ayat** di akhir jawaban.",
      "- Berikan minimal 1 ayat relevan dengan format <quran ref=\"...\">...</quran>.",
      "- Sertakan 1 doa harian via tag <doa query=\"hidayah dan kebaikan\"/>.",
      "- Jelaskan singkat kapan doa tersebut dibaca."
    ].join("\n");
  }

  const ayatRefs = topic.ayatRefs.join(", ");

  return [
    "Tambahkan section **🎯 Rekomendasi Doa & Ayat** di akhir jawaban.",
    `Topik terdeteksi: ${topic.id}.`,
    `- Prioritaskan ayat dengan referensi: ${ayatRefs}.`,
    `- Sertakan 1 doa harian via tag <doa query="${topic.doaQuery}"/>.`,
    "- Jelaskan singkat kapan ayat/doa diamalkan."
  ].join("\n");
}

export function generateAutoFollowUps(question: string): string[] {
  const topic = detectTopic(question);

  if (topic) {
    return topic.followUps;
  }

  return [
    "Bisa berikan dalil ayat yang paling kuat tentang ini?",
    "Apa amalan praktis yang bisa saya mulai hari ini?",
    "Doa apa yang cocok dibaca terkait pembahasan ini?"
  ];
}
