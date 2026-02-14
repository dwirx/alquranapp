import { Sparkles } from "lucide-react";

interface FollowUpSuggestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

const FollowUpSuggestions = ({ questions, onSelect, disabled }: FollowUpSuggestionsProps) => {
  if (questions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-3">
      <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-primary">
        <Sparkles className="h-4 w-4" />
        <span>Follow-up Otomatis</span>
      </div>

      <div className="grid gap-2">
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onSelect(question)}
            disabled={disabled}
            className="text-left text-sm rounded-lg border border-border/50 bg-background/70 px-3 py-2.5 hover:border-primary/40 hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FollowUpSuggestions;
