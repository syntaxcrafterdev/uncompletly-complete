import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ScoreCardProps {
  criteria: {
    id: string;
    name: string;
    description: string;
    maxScore: number;
  };
  teamId: string;
  initialScore?: number;
  initialNotes?: string;
  onSubmit: (data: { score: number; notes: string }) => Promise<void>;
}

export function ScoreCard({
  criteria,
  teamId,
  initialScore = 0,
  initialNotes = '',
  onSubmit,
}: ScoreCardProps) {
  const [score, setScore] = useState(initialScore);
  const [notes, setNotes] = useState(initialNotes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit({ score, notes });
      toast({
        title: 'Score saved',
        description: 'Your score has been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving score:', error);
      toast({
        title: 'Error',
        description: 'Failed to save score. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div>
        <h3 className="font-medium">{criteria.name}</h3>
        <p className="text-sm text-muted-foreground">{criteria.description}</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor={`score-${criteria.id}-${teamId}`}>
            Score: {score} / {criteria.maxScore}
          </Label>
          <span className="text-sm text-muted-foreground">
            {Math.round((score / criteria.maxScore) * 100)}%
          </span>
        </div>
        <Slider
          id={`score-${criteria.id}-${teamId}`}
          min={0}
          max={criteria.maxScore}
          step={0.5}
          value={[score]}
          onValueChange={([value]) => setScore(value)}
          className="py-4"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`notes-${criteria.id}-${teamId}`}>Notes (Optional)</Label>
        <Textarea
          id={`notes-${criteria.id}-${teamId}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this score..."
          className="min-h-[100px]"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Score
          </>
        )}
      </Button>
    </div>
  );
}
