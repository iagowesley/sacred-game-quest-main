import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { useState } from "react";

interface GameCardProps {
  card: any;
  onAnswer: (index: number) => void;
  onChallengeComplete: (completed: boolean) => void;
}

export const GameCard = ({ card, onAnswer, onChallengeComplete }: GameCardProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowFeedback(true);
    
    // Aguarda 2.5 segundos mostrando feedback antes de processar
    setTimeout(() => {
      onAnswer(index);
      setShowFeedback(false);
      setSelectedAnswer(null);
    }, 2500);
  };

  if (card.type === "question") {
    const isCorrect = selectedAnswer === card.correct;
    
    return (
      <Dialog open={true}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-4 border-primary/30 bg-gradient-to-br from-card via-background to-card animate-card-entrance" style={{ boxShadow: 'var(--shadow-card-3d)' }}>
          {/* Card decorative header */}
          <div className="relative h-32 bg-primary overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'var(--card-texture)', backgroundSize: '20px 20px' }}></div>
            <div className="absolute bottom-4 left-4">
              <h3 className="text-2xl font-bold text-white drop-shadow-lg">Pergunta bíblica</h3>
              <p className="text-sm text-white/90">Responda corretamente para avançar</p>
            </div>
            {/* Decorative corner ornaments */}
            <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-white/30"></div>
            <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-white/30"></div>
          </div>

          {/* Card body */}
          <div className="p-8 space-y-6">
            <div className="relative p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 shadow-inner">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold">
                Pergunta
              </div>
              <p className="text-lg font-semibold text-foreground leading-relaxed">
                {card.question}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
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
                    className={`h-auto py-4 px-6 text-base border-3 transition-all duration-300 justify-start ${
                      showCorrect 
                        ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                        : showWrong 
                        ? 'border-red-500 bg-red-50 dark:bg-red-950'
                        : 'border-primary/30 hover:border-primary hover:bg-primary/10'
                    }`}
                  >
                    <span className={`w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold text-white shadow-md ${
                      showCorrect 
                        ? 'bg-green-500' 
                        : showWrong 
                        ? 'bg-red-500'
                        : 'bg-primary'
                    }`}>
                      {showFeedback && showCorrect ? '✓' : showFeedback && showWrong ? '✗' : String.fromCharCode(65 + index)}
                    </span>
                    <span className="relative">{option}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Card footer decoration */}
          <div className="h-4 bg-primary"></div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-4 border-accent/30 bg-gradient-to-br from-card via-background to-card animate-card-entrance" style={{ boxShadow: 'var(--shadow-card-3d)' }}>
        {/* Card decorative header */}
        <div className="relative h-32 bg-accent overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'var(--card-texture)', backgroundSize: '20px 20px' }}></div>
          <div className="absolute top-4 left-4 w-16 h-16 bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="absolute bottom-4 left-4">
            <h3 className="text-2xl font-bold text-white drop-shadow-lg">Prenda!</h3>
            <p className="text-sm text-white/90">Complete o desafio</p>
          </div>
          {/* Decorative corner ornaments */}
          <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-white/30"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-white/30"></div>
        </div>

        {/* Card body */}
          <div className="p-8 space-y-6">
          <div className="relative p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent/30 shadow-inner">
            <div className="absolute -top-3 left-6 px-3 py-1 bg-accent text-white text-xs font-bold">
              Desafio
            </div>
            <p className="text-lg font-semibold text-foreground leading-relaxed">
              {card.text}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => onChallengeComplete(false)}
              variant="outline"
              className="h-14 text-base border-3 border-destructive/30 hover:bg-destructive/10 hover:border-destructive transition-all duration-300"
            >
              Não completou
            </Button>
            <Button
              onClick={() => onChallengeComplete(true)}
              className="h-14 text-base bg-accent hover:bg-accent/90 hover:shadow-[var(--shadow-gold)] transition-all duration-300"
            >
              Completou!
            </Button>
          </div>
        </div>

        {/* Card footer decoration */}
        <div className="h-4 bg-accent"></div>
      </DialogContent>
    </Dialog>
  );
};
