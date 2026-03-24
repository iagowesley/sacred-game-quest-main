import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  CheckFat,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";

interface GameCardProps {
  card: any;
  onAnswer: (index: number) => void;
  onChallengeComplete: (completed: boolean) => void;
  onClose: () => void;
}

export const GameCard = ({ card, onAnswer, onChallengeComplete, onClose }: GameCardProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowFeedback(true);
    setTimeout(() => {
      onAnswer(index);
      setShowFeedback(false);
      setSelectedAnswer(null);
    }, 2500);
  };

  if (card.type === "question") {
    const isCorrect = selectedAnswer === card.correct;

    return (
      <Dialog open={true} onOpenChange={(open) => { if (!open && !showFeedback) onClose(); }}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border border-primary/30 bg-card animate-card-entrance" style={{ boxShadow: 'var(--shadow-card-3d)' }}>
          {/* Header */}
          <div className="relative h-24 overflow-hidden bg-primary flex items-end p-5">
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white">Pergunta Bíblica</h3>
              <p className="text-sm text-white/75">Responda corretamente para avançar</p>
            </div>
            <button
              onClick={() => { if (!showFeedback) onClose(); }}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Fechar"
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <div className="p-5 bg-muted/50 border border-primary/20 rounded-xl relative">
              <span className="absolute -top-3 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                Pergunta
              </span>
              <p className="text-base font-semibold text-foreground leading-relaxed">
                {card.question}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {card.options.map((option: string, index: number) => {
                const isSelected = selectedAnswer === index;
                const showCorrect = showFeedback && index === card.correct;
                const showWrong = showFeedback && isSelected && !isCorrect;

                return (
                  <Button
                    key={index}
                    onClick={() => !showFeedback && handleAnswer(index)}
                    disabled={showFeedback}
                    variant="outline"
                    className={`h-auto py-3 px-4 text-sm border-2 transition-all duration-300 justify-start gap-3 ${
                      showCorrect
                        ? 'border-green-500 bg-green-500/10 text-foreground'
                        : showWrong
                        ? 'border-red-500 bg-red-500/10 text-foreground'
                        : 'border-border hover:border-primary hover:bg-primary/10'
                    }`}
                  >
                    <span className={`w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-full text-xs font-bold ${
                      showCorrect ? 'bg-green-500 text-white' : showWrong ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'
                    }`}>
                      {showCorrect
                        ? <CheckCircle size={14} weight="fill" />
                        : showWrong
                        ? <XCircle size={14} weight="fill" />
                        : String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="h-2.5 bg-primary rounded-b" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onChallengeComplete(false); }}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border border-border/40 bg-card animate-card-entrance" style={{ boxShadow: 'var(--shadow-card-3d)' }}>
        {/* Header */}
        <div className="relative h-24 overflow-hidden bg-muted flex items-end p-5">
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-foreground">Prenda!</h3>
            <p className="text-sm text-muted-foreground">Complete o desafio para avançar</p>
          </div>
          <button
            onClick={() => onChallengeComplete(false)}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition-colors"
            aria-label="Fechar"
          >
            <X size={16} className="text-foreground/70" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="p-5 bg-muted/50 border border-border/30 rounded-xl relative">
            <span className="absolute -top-3 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
              Desafio
            </span>
            <p className="text-base font-semibold text-foreground leading-relaxed">
              {card.text}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => onChallengeComplete(false)}
              variant="outline"
              className="h-12 text-sm border-2 border-destructive/40 hover:bg-destructive/10 hover:border-destructive gap-2"
            >
              <X size={16} />
              Não completou
            </Button>
            <Button
              onClick={() => onChallengeComplete(true)}
              className="h-12 text-sm bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              <CheckFat size={16} weight="fill" />
              Completou!
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="h-2.5 bg-primary rounded-b" />
      </DialogContent>
    </Dialog>
  );
};
