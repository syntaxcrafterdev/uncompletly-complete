import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TeamsList } from '@/components/teams/TeamsList';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

export function EventTeamsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  // Fetch event details
  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data } = await api.get(`/events/${eventId}`);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading event. Please try again later.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{event.title} Teams</h1>
            <p className="text-muted-foreground mt-2">
              Join an existing team or create your own to participate in this event.
            </p>
          </div>
        </div>

        <TeamsList eventId={eventId!} />
      </div>
    </div>
  );
}
