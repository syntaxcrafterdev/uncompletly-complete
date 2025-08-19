import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Search, Plus } from 'lucide-react';

type EventStatus = 'upcoming' | 'ongoing' | 'completed';

interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: EventStatus;
  participants: number;
  maxParticipants: number;
  image?: string;
}

export function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');

  // Mock data - replace with actual API call
  const events: Event[] = [
    {
      id: '1',
      name: 'Hack the Future',
      description: 'A 48-hour hackathon for innovative solutions to global challenges',
      startDate: '2023-12-15',
      endDate: '2023-12-17',
      location: 'San Francisco, CA',
      status: 'upcoming',
      participants: 120,
      maxParticipants: 200,
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
    {
      id: '2',
      name: 'Code & Create',
      description: 'Build something amazing in 24 hours with fellow developers',
      startDate: '2023-11-10',
      endDate: '2023-11-11',
      location: 'Online',
      status: 'ongoing',
      participants: 85,
      maxParticipants: 100,
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80',
    },
    {
      id: '3',
      name: 'Tech Innovators',
      description: 'Showcase your innovative tech projects to industry leaders',
      startDate: '2023-10-28',
      endDate: '2023-10-29',
      location: 'New York, NY',
      status: 'completed',
      participants: 150,
      maxParticipants: 150,
      image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80',
    },
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: EventStatus) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground">
            Browse and manage all events
          </p>
        </div>
        <Button asChild>
          <Link to="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button
            variant={statusFilter === 'ongoing' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ongoing')}
          >
            Ongoing
          </Button>
          <Button
            variant={statusFilter === 'completed' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </Button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium">No events found</p>
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create a new event to get started'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="relative h-48">
                <img
                  src={event.image || 'https://images.unsplash.com/photo-1511578314323-379af4e65c98?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'}
                  alt={event.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-2 right-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(event.status)}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      <Link to={`/events/${event.id}`} className="hover:underline">
                        {event.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {event.location} • {formatDate(event.startDate)} - {formatDate(event.endDate)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {event.description}
                </p>
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Participants</span>
                    <span className="font-medium">
                      {event.participants}/{event.maxParticipants}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(event.participants / event.maxParticipants) * 100}%`,
                        maxWidth: '100%',
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
