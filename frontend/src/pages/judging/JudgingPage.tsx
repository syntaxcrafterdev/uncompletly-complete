import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { JudgingDashboard } from '@/components/judging/JudgingDashboard';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

export function JudgingPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Verify user is a judge for this event
  const { data: isJudge, isLoading: isLoadingJudgeCheck } = useQuery({
    queryKey: ['judge-check', eventId],
    queryFn: async () => {
      if (!eventId) return false;
      try {
        const { data } = await api.get(`/events/${eventId}/judges/${user?.id}`);
        return data.isJudge;
      } catch (error) {
        return false;
      }
    },
  });

  // Fetch event details
  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data } = await api.get(`/events/${eventId}`);
      return data;
    },
    enabled: !!eventId,
  });

  if (isLoadingJudgeCheck || isLoadingEvent) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not a judge
  if (!isJudge) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-muted-foreground mb-6">
          You don't have permission to access the judging panel for this event.
        </p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event
        </Button>
        
        <h1 className="text-3xl font-bold tracking-tight">
          Judging: {event?.title}
        </h1>
        <p className="text-muted-foreground">
          Welcome to the judging panel. Please evaluate each team fairly based on the criteria.
        </p>
      </div>

      {eventId && <JudgingDashboard eventId={eventId} />}
    </div>
  );
}
