import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/config/api';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  repoUrl: string;
  demoUrl?: string;
  technologies: string[];
};

export function TeamSubmissionPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [project, setProject] = useState<Omit<Project, 'id'>>({ 
    name: '',
    description: '',
    repoUrl: '',
    demoUrl: '',
    technologies: []
  });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newTech, setNewTech] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail) return;
    
    // In a real app, you would validate the email and fetch user details
    const newMember: TeamMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      role: 'member'
    };
    
    setMembers([...members, newMember]);
    setNewMemberEmail('');
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter(member => member.id !== memberId));
  };

  const handleAddTechnology = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTech || project.technologies.includes(newTech)) return;
    
    setProject({
      ...project,
      technologies: [...project.technologies, newTech]
    });
    setNewTech('');
  };

  const handleRemoveTechnology = (tech: string) => {
    setProject({
      ...project,
      technologies: project.technologies.filter(t => t !== tech)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName || !project.name || !project.description || !project.repoUrl) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // In a real app, you would submit this data to your API
      await api.post(`/events/${eventId}/teams`, {
        team: {
          name: teamName,
          members: members.map(m => ({
            email: m.email,
            role: m.role
          }))
        },
        project: {
          ...project,
          eventId
        }
      });

      toast({
        title: 'Success!',
        description: 'Your team and project have been submitted successfully',
      });
      
      // Redirect to team dashboard or confirmation page
      // navigate(`/events/${eventId}/team`);
      
    } catch (error) {
      console.error('Error submitting team:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit team. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Team & Project Submission</h1>
          <p className="text-muted-foreground mt-2">
            Register your team and submit your project for the event
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Team Information */}
          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
              <CardDescription>
                Enter your team details and add team members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="teamName">Team Name *</Label>
                <Input
                  id="teamName"
                  placeholder="Enter your team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Team Members</Label>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  <form onSubmit={handleAddMember} className="flex space-x-2">
                    <Input
                      type="email"
                      placeholder="Enter team member email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                    />
                    <Button type="submit" variant="outline">
                      Add Member
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                Tell us about your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  placeholder="Enter your project name"
                  value={project.name}
                  onChange={(e) => setProject({...project, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="projectDescription">Project Description *</Label>
                <Textarea
                  id="projectDescription"
                  placeholder="Describe your project in detail"
                  value={project.description}
                  onChange={(e) => setProject({...project, description: e.target.value})}
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="repoUrl">Repository URL *</Label>
                  <Input
                    id="repoUrl"
                    type="url"
                    placeholder="https://github.com/username/repo"
                    value={project.repoUrl}
                    onChange={(e) => setProject({...project, repoUrl: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="demoUrl">Live Demo URL (optional)</Label>
                  <Input
                    id="demoUrl"
                    type="url"
                    placeholder="https://your-app.vercel.app"
                    value={project.demoUrl}
                    onChange={(e) => setProject({...project, demoUrl: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label>Technologies Used</Label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {project.technologies.map((tech) => (
                      <span 
                        key={tech} 
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {tech}
                        <button 
                          type="button" 
                          className="ml-2 text-primary/70 hover:text-primary"
                          onClick={() => handleRemoveTechnology(tech)}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <form onSubmit={handleAddTechnology} className="flex space-x-2">
                    <Input
                      placeholder="Add a technology (e.g., React, Node.js)"
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                    />
                    <Button type="submit" variant="outline">
                      Add
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link to={`/events/${eventId}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
