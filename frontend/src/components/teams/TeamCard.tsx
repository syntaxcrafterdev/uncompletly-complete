import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Users, UserPlus, UserX } from 'lucide-react';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'leader' | 'member';
}

interface TeamCardProps {
  id: string;
  name: string;
  members: TeamMember[];
  maxMembers: number;
  eventId: string;
  isMember: boolean;
  isLeader: boolean;
  onJoin?: (teamId: string) => void;
  onLeave?: (teamId: string) => void;
}

export function TeamCard({
  id,
  name,
  members = [],
  maxMembers = 5,
  eventId,
  isMember = false,
  isLeader = false,
  onJoin,
  onLeave,
}: TeamCardProps) {
  const availableSlots = maxMembers - members.length;
  const isFull = availableSlots <= 0;

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Users className="h-4 w-4 mr-1" />
              <span>
                {members.length} / {maxMembers} members
              </span>
              {isFull && (
                <Badge variant="destructive" className="ml-2">
                  Full
                </Badge>
              )}
            </div>
          </div>
          {isLeader && (
            <Badge variant="secondary" className="ml-2">
              Leader
            </Badge>
          )}
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Team Members</h4>
          <div className="flex -space-x-2">
            {members.map((member) => (
              <Avatar key={member._id} className="border-2 border-white">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
                {member.role === 'leader' && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">L</span>
                  </div>
                )}
              </Avatar>
            ))}
            {Array(availableSlots).fill(0).map((_, i) => (
              <Avatar key={`empty-${i}`} className="border-2 border-white">
                <AvatarFallback className="bg-gray-100 text-gray-400">
                  <UserPlus className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/events/${eventId}/teams/${id}`}>View Team</Link>
          </Button>
          {isMember ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLeave?.(id)}
              className="text-destructive hover:text-destructive"
            >
              <UserX className="h-4 w-4 mr-1" />
              Leave
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onJoin?.(id)}
              disabled={isFull}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Join Team
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
