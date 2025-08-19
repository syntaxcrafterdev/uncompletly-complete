import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '@/lib/api';

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  isOnline: boolean;
  status: 'upcoming' | 'ongoing' | 'completed';
  maxParticipants: number;
}

export function EventsList() {
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await api.get('/events');
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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading events. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Upcoming Events</h2>
        <Button asChild>
          <Link to="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events?.map((event) => (
          <Link to={`/events/${event._id}`} key={event._id} className="block">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {format(new Date(event.startDate), 'MMM d, yyyy')} • {event.location}
                    </CardDescription>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {event.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                  <span>{event.maxParticipants} participants max</span>
                  <Button variant="link" className="p-0 h-auto">
                    View details →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
