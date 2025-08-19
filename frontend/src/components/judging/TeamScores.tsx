import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ScoreCard } from './ScoreCard';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

interface Criteria {
  id: string;
  name: string;
  description: string;
  maxScore: number;
}

interface Score {
  id: string;
  criteriaId: string;
  score: number;
  notes: string;
}

interface TeamScoresProps {
  eventId: string;
  teamId: string;
  teamName: string;
  onBack: () => void;
}

export function TeamScores({ eventId, teamId, teamName, onBack }: TeamScoresProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch judging criteria for the event
  const { data: criteria = [], isLoading: isLoadingCriteria } = useQuery<Criteria[]>({
    queryKey: ['judging-criteria', eventId],
    queryFn: async () => {
      const { data } = await api.get(`/judging/criteria/${eventId}`);
      return data;
    },
  });

  // Fetch existing scores for this team
  const { data: existingScores = [], isLoading: isLoadingScores } = useQuery<Score[]>({
    queryKey: ['scores', eventId, teamId],
    queryFn: async () => {
      const { data } = await api.get('/judging/scores', {
        params: { eventId, teamId },
      });
      return data;
    },
  });

  // Create or update score mutation
  const saveScoreMutation = useMutation({
    mutationFn: async (data: { criteriaId: string; score: number; notes: string }) => {
      const { criteriaId, score, notes } = data;
      const existingScore = existingScores.find(s => s.criteriaId === criteriaId);
      
      if (existingScore) {
        // Update existing score
        await api.put(`/judging/scores/${existingScore.id}`, { score, notes });
      } else {
        // Create new score
        await api.post('/judging/scores', {
          criteriaId,
          teamId,
          score,
          notes,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', eventId, teamId] });
      queryClient.invalidateQueries({ queryKey: ['judging-progress', eventId] });
    },
  });

  const handleScoreSubmit = async (criteriaId: string, data: { score: number; notes: string }) => {
    try {
      await saveScoreMutation.mutateAsync({
        criteriaId,
        ...data,
      });
    } catch (error) {
      console.error('Error saving score:', error);
      throw error; // Let the ScoreCard handle the error
    }
  };

  if (isLoadingCriteria || isLoadingScores) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" onClick={onBack} className="mb-4">
          ← Back to Teams
        </Button>
        <h2 className="text-2xl font-bold">{teamName}</h2>
        <p className="text-muted-foreground">
          Score this team based on the following criteria
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {criteria.map((criterion) => {
          const existingScore = existingScores.find(s => s.criteriaId === criterion.id);
          
          return (
            <ScoreCard
              key={criterion.id}
              criteria={criterion}
              teamId={teamId}
              initialScore={existingScore?.score || 0}
              initialNotes={existingScore?.notes || ''}
              onSubmit={(data) => handleScoreSubmit(criterion.id, data)}
            />
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={onBack} variant="outline">
          Back to Teams
        </Button>
      </div>
    </div>
  );
}
