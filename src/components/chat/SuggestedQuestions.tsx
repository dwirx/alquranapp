import { MessageSquare } from "lucide-react";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "Ayat tentang sabar dalam menghadapi cobaan",
  "Doa sebelum tidur dan bangun tidur",
  "Kisah Nabi Musa dan Firaun",
  "Hukum riba dalam Islam",
  "Keutamaan bulan Ramadhan",
  "Ayat tentang berbakti kepada orang tua",
];

const SuggestedQuestions = ({ onSelect, disabled }: SuggestedQuestionsProps) => {
  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto px-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 shadow-sm">
          <MessageSquare className="h-4 w-4" />
          <span>Mulai Percakapan</span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-foreground/80">
          Tanyakan tentang Al-Quran & Islam
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {SUGGESTED_QUESTIONS.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            disabled={disabled}
            className="group relative p-4 rounded-2xl border border-border/50 bg-card/40 hover:bg-card/80 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <MessageSquare className="h-3.5 w-3.5" />
              </span>
              <p className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors line-clamp-2">
                {question}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
