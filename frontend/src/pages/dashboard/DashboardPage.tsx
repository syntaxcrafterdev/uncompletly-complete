import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, Users, Trophy, Plus } from 'lucide-react';

export function DashboardPage() {
  // Mock data - replace with actual data from your API
  const stats = [
    { name: 'Upcoming Events', value: '5', icon: Calendar },
    { name: 'Ongoing Events', value: '3', icon: Clock },
    { name: 'Total Participants', value: '1,234', icon: Users },
    { name: 'Total Prizes', value: '$25,000', icon: Trophy },
  ];

  const recentEvents = [
    {
      id: 1,
      name: 'Hack the Future',
      date: '2023-11-15',
      participants: 120,
      status: 'upcoming',
    },
    {
      id: 2,
      name: 'Code & Create',
      date: '2023-11-10',
      participants: 85,
      status: 'ongoing',
    },
    {
      id: 3,
      name: 'Tech Innovators',
      date: '2023-10-28',
      participants: 150,
      status: 'completed',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">Here's what's happening with your events.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Event
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Events */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{event.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()} • {event.participants} participants
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : undefined,
                      event.status === 'ongoing' ? 'bg-green-100 text-green-800' : undefined,
                      event.status === 'completed' ? 'bg-gray-100 text-gray-800' : undefined
                    )}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { event: 'Hack the Future', deadline: 'Submission closes in 2 days', type: 'submission' },
                { event: 'Code & Create', deadline: 'Judging starts tomorrow', type: 'judging' },
                { event: 'Tech Innovators', deadline: 'Results announced next week', type: 'results' },
              ].map((item, index) => (
                <div key={index} className="flex items-start pb-4 last:pb-0 last:mb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.event}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.deadline}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
