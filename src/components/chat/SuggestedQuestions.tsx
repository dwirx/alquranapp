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
    <div className="space-y-4">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <MessageSquare className="h-4 w-4" />
          Mulai dengan pertanyaan
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SUGGESTED_QUESTIONS.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            disabled={disabled}
            className="p-4 rounded-xl border-2 border-border bg-card text-left transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {question}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
