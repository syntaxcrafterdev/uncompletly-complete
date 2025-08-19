import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Plus, Loader2, Users, Search } from 'lucide-react';
import { TeamCard } from './TeamCard';
import { TeamForm } from './TeamForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

interface Team {
  _id: string;
  name: string;
  description?: string;
  members: Array<{
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'leader' | 'member';
  }>;
  maxMembers: number;
  eventId: string;
}

export function TeamsList({ eventId }: { eventId: string }) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch teams for the event
  const {
    data: teams = [],
    isLoading,
    error,
  } = useQuery<Team[]>({
    queryKey: ['teams', eventId],
    queryFn: async () => {
      const { data } = await api.get(`/events/${eventId}/teams`);
      return data;
    },
  });

  // Get current user's team
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data;
    },
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (teamData: { name: string; description?: string; maxMembers: number }) => {
      const { data } = await api.post('/teams', { ...teamData, eventId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', eventId] });
      setIsCreateDialogOpen(false);
      toast({
        title: 'Team created successfully',
        description: 'Your team is now ready to accept members.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating team',
        description: error.response?.data?.message || 'Failed to create team',
        variant: 'destructive',
      });
    },
  });

  // Join team mutation
  const joinTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      await api.post(`/teams/${teamId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', eventId] });
      toast({
        title: 'Success',
        description: 'You have joined the team!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error joining team',
        description: error.response?.data?.message || 'Failed to join team',
        variant: 'destructive',
      });
    },
  });

  // Leave team mutation
  const leaveTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      await api.post(`/teams/${teamId}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', eventId] });
      toast({
        title: 'Success',
        description: 'You have left the team.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error leaving team',
        description: error.response?.data?.message || 'Failed to leave team',
        variant: 'destructive',
      });
    },
  });

  const handleCreateTeam = (data: { name: string; description?: string; maxMembers: number }) => {
    createTeamMutation.mutate(data);
  };

  const handleJoinTeam = (teamId: string) => {
    joinTeamMutation.mutate(teamId);
  };

  const handleLeaveTeam = (teamId: string) => {
    if (window.confirm('Are you sure you want to leave this team?')) {
      leaveTeamMutation.mutate(teamId);
    }
  };

  // Filter teams based on search query
  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if user is already in a team
  const userTeam = teams.find((team) =>
    team.members.some((member) => member._id === currentUser?._id)
  );

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
        <p className="text-red-500">Error loading teams. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search teams..."
              className="pl-9 w-full sm:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {!userTeam && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No teams yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {userTeam
              ? 'You are already in a team.'
              : 'Be the first to create a team for this event.'}
          </p>
          {!userTeam && (
            <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          )}
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No teams found matching your search.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team._id}
              id={team._id}
              name={team.name}
              members={team.members}
              maxMembers={team.maxMembers}
              eventId={team.eventId}
              isMember={team.members.some((m) => m._id === currentUser?._id)}
              isLeader={team.members.some(
                (m) => m._id === currentUser?._id && m.role === 'leader'
              )}
              onJoin={handleJoinTeam}
              onLeave={handleLeaveTeam}
            />
          ))}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new team</DialogTitle>
          </DialogHeader>
          <TeamForm
            onSubmit={handleCreateTeam}
            isLoading={createTeamMutation.isPending}
            submitButtonText="Create Team"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
