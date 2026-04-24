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
        <DialogContent className="max-w-4xl p-0 overflow-hidden border border-primary/30 bg-card animate-card-entrance" style={{ boxShadow: 'var(--shadow-card-3d)' }}>
          {/* Header */}
          <div className="relative flex h-32 items-end overflow-hidden bg-primary p-8">
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-white">Pergunta Bíblica</h3>
              <p className="text-base text-white/75">Responda corretamente para avançar</p>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-7 p-8">
            <div className="relative rounded-2xl border border-primary/20 bg-muted/50 p-7">
              <span className="absolute -top-4 left-5 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                Pergunta
              </span>
              <p className="text-xl font-semibold leading-relaxed text-foreground">
                {card.question}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
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
                    className={`h-auto justify-start gap-4 border-2 px-6 py-5 text-base transition-all duration-300 ${
                      showCorrect
                        ? 'border-green-500 bg-green-500/10 text-foreground'
                        : showWrong
                        ? 'border-red-500 bg-red-500/10 text-foreground'
                        : 'border-border hover:border-primary hover:bg-primary/10'
                    }`}
                  >
                    <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      showCorrect ? 'bg-green-500 text-white' : showWrong ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'
                    }`}>
                      {showCorrect
                        ? <CheckCircle size={18} weight="fill" />
                        : showWrong
                        ? <XCircle size={18} weight="fill" />
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
      <DialogContent className="max-w-4xl p-0 overflow-hidden border border-border/40 bg-card animate-card-entrance" style={{ boxShadow: 'var(--shadow-card-3d)' }}>
        {/* Header */}
        <div className="relative flex h-32 items-end overflow-hidden bg-muted p-8">
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-foreground">Prenda!</h3>
            <p className="text-base text-muted-foreground">Complete o desafio para avançar</p>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-7 p-8">
          <div className="relative rounded-2xl border border-border/30 bg-muted/50 p-7">
            <span className="absolute -top-4 left-5 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
              Desafio
            </span>
            <p className="text-xl font-semibold leading-relaxed text-foreground">
              {card.text}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => onChallengeComplete(false)}
              variant="outline"
              className="min-h-16 gap-2 border-2 border-destructive/40 text-base hover:border-destructive hover:bg-destructive/10"
            >
              <X size={20} />
              Não completou
            </Button>
            <Button
              onClick={() => onChallengeComplete(true)}
              className="min-h-16 gap-2 bg-primary text-base text-primary-foreground hover:bg-primary/90"
            >
              <CheckFat size={20} weight="fill" />
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
