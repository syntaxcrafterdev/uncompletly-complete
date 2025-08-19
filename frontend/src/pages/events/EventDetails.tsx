import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loader2, ArrowLeft, Edit, Users, Calendar, MapPin, Clock } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  isOnline: boolean;
  status: 'upcoming' | 'ongoing' | 'completed';
  maxParticipants?: number;
  organizer: {
    _id: string;
    name: string;
    email: string;
  };
  participants?: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
}

export function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await api.get(`/events/${id}`);
      return data;
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/events/${id}/register`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/events/${id}/register`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    },
  });

  const isRegistered = event?.participants?.some(p => p._id === user?.id) ?? false;
  const isOrganizer = event?.organizer._id === user?.id;
  const participantCount = event?.participants?.length ?? 0;
  const maxParticipants = event?.maxParticipants ?? 0;
  const isFull = participantCount >= maxParticipants;
  const canRegister = !isRegistered && !isOrganizer && !isFull && event?.status === 'upcoming';

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
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Button>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-3xl">{event.title}</CardTitle>
                    <Badge variant={event.status === 'upcoming' ? 'default' : event.status === 'ongoing' ? 'secondary' : 'outline'} className="capitalize">
                      {event.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-2">
                    Organized by {event.organizer.name}
                  </p>
                </div>
                {isOrganizer && (
                  <Button variant="outline" onClick={() => navigate(`/events/${id}/edit`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(event.startDate), 'MMMM d, yyyy')} -{' '}
                    {format(new Date(event.endDate), 'MMMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.location}</span>
                  {event.isOnline && <Badge variant="outline" className="ml-2">Online</Badge>}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {participantCount} / {maxParticipants > 0 ? maxParticipants : '∞'} participants
                    {isFull && <span className="text-red-500 ml-2">(Full)</span>}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-2">About This Event</h3>
                <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-1/3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isOrganizer ? (
                <Button className="w-full" onClick={() => navigate(`/events/${id}/manage`)}>
                  Manage Event
                </Button>
              ) : isRegistered ? (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => unregisterMutation.mutate()}
                  disabled={unregisterMutation.isPending}
                >
                  {unregisterMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Unregistering...
                    </>
                  ) : (
                    'Unregister'
                  )}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => registerMutation.mutate()}
                  disabled={!canRegister || registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : isFull ? (
                    'Event Full'
                  ) : (
                    'Register for Event'
                  )}
                </Button>
              )}

              <Button variant="outline" className="w-full">
                Add to Calendar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Starts: {format(new Date(event.startDate), 'MMM d, yyyy h:mm a')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Ends: {format(new Date(event.endDate), 'MMM d, yyyy h:mm a')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
