import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, Award, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TeamScores } from './TeamScores';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

interface Team {
  id: string;
  name: string;
  members: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  project?: {
    id: string;
    name: string;
    description: string;
  };
}

interface JudgingProgress {
  judge: {
    id: string;
    name: string;
    email: string;
  };
  completed: number;
  total: number;
  percentage: number;
}

interface JudgingDashboardProps {
  eventId: string;
}

export function JudgingDashboard({ eventId }: JudgingDashboardProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const { toast } = useToast();

  // Fetch teams for the event
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: ['event-teams', eventId],
    queryFn: async () => {
      const { data } = await api.get(`/events/${eventId}/teams`);
      return data;
    },
  });

  // Fetch judging progress
  const { data: judgingProgress = [], isLoading: isLoadingProgress } = useQuery<JudgingProgress[]>({
    queryKey: ['judging-progress', eventId],
    queryFn: async () => {
      const { data } = await api.get(`/judging/progress/${eventId}`);
      return data;
    },
  });

  // Handle team selection
  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
  };

  // Handle back to teams list
  const handleBackToList = () => {
    setSelectedTeam(null);
  };

  if (isLoadingTeams || isLoadingProgress) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If a team is selected, show their scores
  if (selectedTeam) {
    return (
      <TeamScores
        eventId={eventId}
        teamId={selectedTeam.id}
        teamName={selectedTeam.name}
        onBack={handleBackToList}
      />
    );
  }

  // Show the main judging dashboard
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Judging Dashboard</h1>
        <p className="text-muted-foreground">
          Select a team to begin judging or view progress
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams to Judge</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
            <p className="text-xs text-muted-foreground">Total teams registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Judging Progress</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {judgingProgress[0]?.completed || 0} / {judgingProgress[0]?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {judgingProgress[0]?.percentage || 0}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teams.filter(t => t.project?.id).length}
            </div>
            <p className="text-xs text-muted-foreground">Teams with submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teams.length - teams.filter(t => t.project?.id).length}
            </div>
            <p className="text-xs text-muted-foreground">Teams without submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Teams</h2>
          <div className="text-sm text-muted-foreground">
            Showing {teams.length} teams
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6" onClick={() => handleTeamSelect(team)}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Judge Team
                  </Button>
                </div>

                {team.project && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium">Project</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {team.project.name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
