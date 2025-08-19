import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useToast } from '@/components/ui/use-toast';
import api from '@/config/api';

type Project = {
  id: string;
  name: string;
  teamName: string;
  description: string;
  repoUrl: string;
  demoUrl?: string;
  technologies: string[];
  averageScore?: number;
  status: 'pending' | 'in-progress' | 'completed';
};

type Criteria = {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  weight: number;
};

type Evaluation = {
  criteriaId: string;
  score: number;
  comments: string;
};

export function JudgingDashboard() {
  const { eventId } = useParams<{ eventId: string }>();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');

  // Fetch projects and criteria
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // In a real app, you would fetch these from your API
        const [projectsRes, criteriaRes] = await Promise.all([
          api.get(`/events/${eventId}/projects`),
          api.get(`/events/${eventId}/judging-criteria`)
        ]);
        
        setProjects(projectsRes.data);
        setCriteria(criteriaRes.data);
        
        // Initialize evaluations
        const initialEvaluations: Record<string, Evaluation> = {};
        criteriaRes.data.forEach((criterion: Criteria) => {
          initialEvaluations[criterion.id] = {
            criteriaId: criterion.id,
            score: 0,
            comments: ''
          };
        });
        setEvaluations(initialEvaluations);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load judging data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId, toast]);

  const handleScoreChange = (criteriaId: string, score: number) => {
    setEvaluations(prev => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        score: Math.min(Math.max(0, score), getCriteriaById(criteriaId)?.maxScore || 10)
      }
    }));
  };

  const handleCommentChange = (criteriaId: string, comments: string) => {
    setEvaluations(prev => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        comments
      }
    }));
  };

  const getCriteriaById = (id: string) => criteria.find(c => c.id === id);

  const calculateTotalScore = () => {
    return Object.values(evaluations).reduce((total, evaluation) => {
      const criterion = getCriteriaById(evaluation.criteriaId);
      if (!criterion) return total;
      
      // Calculate weighted score
      return total + (evaluation.score * criterion.weight);
    }, 0);
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedProject) return;
    
    try {
      setIsLoading(true);
      
      await api.post(`/events/${eventId}/evaluations`, {
        projectId: selectedProject.id,
        evaluations: Object.values(evaluations),
        totalScore: calculateTotalScore()
      });
      
      toast({
        title: 'Success!',
        description: 'Evaluation submitted successfully',
      });
      
      // Update project status
      setProjects(prev => 
        prev.map(p => 
          p.id === selectedProject.id 
            ? { ...p, status: 'completed', averageScore: calculateTotalScore() } 
            : p
        )
      );
      
      // Reset form
      setSelectedProject(null);
      setActiveTab('projects');
      
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit evaluation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading judging dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Judging Dashboard</h1>
          <p className="text-muted-foreground">
            Evaluate and score projects for this event
          </p>
        </div>
        <Button asChild>
          <Link to={`/events/${eventId}`}>Back to Event</Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="criteria" disabled={!selectedProject}>
            Evaluation Criteria
          </TabsTrigger>
          <TabsTrigger value="scores" disabled={!selectedProject}>
            Scoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className={`cursor-pointer transition-shadow hover:shadow-md ${
                  selectedProject?.id === project.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedProject(project);
                  setActiveTab('criteria');
                }}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{project.name}</CardTitle>
                    <Badge 
                      variant={
                        project.status === 'completed' 
                          ? 'default' 
                          : project.status === 'in-progress' 
                            ? 'secondary' 
                            : 'outline'
                      }
                    >
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <CardDescription>Team: {project.teamName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {project.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Progress</span>
                      <span>
                        {project.averageScore 
                          ? `${Math.round(project.averageScore)}/100` 
                          : 'Not scored'}
                      </span>
                    </div>
                    <Progress 
                      value={project.averageScore || 0} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="criteria">
          {selectedProject && (
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Criteria</CardTitle>
                <CardDescription>
                  Review the criteria for {selectedProject.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Project: {selectedProject.name}</h3>
                  <p className="text-muted-foreground">{selectedProject.description}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <span className="font-medium w-24">Repository:</span>
                      <a 
                        href={selectedProject.repoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View on GitHub
                      </a>
                    </div>
                    {selectedProject.demoUrl && (
                      <div className="flex items-center">
                        <span className="font-medium w-24">Live Demo:</span>
                        <a 
                          href={selectedProject.demoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View Live Demo
                        </a>
                      </div>
                    )}
                    <div className="flex items-start">
                      <span className="font-medium w-24">Technologies:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedProject.technologies.map(tech => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Judging Criteria</h3>
                  <div className="space-y-6">
                    {criteria.map((criterion) => (
                      <div key={criterion.id} className="space-y-2">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{criterion.name}</h4>
                          <span className="text-sm text-muted-foreground">
                            Max {criterion.maxScore} points • Weight: {criterion.weight}x
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {criterion.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => setActiveTab('scores')}>
                    Begin Evaluation
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scores">
          {selectedProject && (
            <Card>
              <CardHeader>
                <CardTitle>Score Project: {selectedProject.name}</CardTitle>
                <CardDescription>
                  Evaluate the project based on the criteria below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {criteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-4">
                    <div>
                      <div className="flex justify-between">
                        <h4 className="font-medium">{criterion.name}</h4>
                        <span className="text-sm text-muted-foreground">
                          {evaluations[criterion.id]?.score || 0} / {criterion.maxScore} points
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {criterion.description}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium w-16">Score:</span>
                        <input
                          type="range"
                          min="0"
                          max={criterion.maxScore}
                          step="0.5"
                          value={evaluations[criterion.id]?.score || 0}
                          onChange={(e) => 
                            handleScoreChange(criterion.id, parseFloat(e.target.value))
                          }
                          className="flex-1"
                        />
                        <span className="w-12 text-right font-mono">
                          {evaluations[criterion.id]?.score?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 text-xs text-muted-foreground px-2">
                        <span>0 - Poor</span>
                        <span className="text-center">
                          {Math.floor(criterion.maxScore / 2)} - Average
                        </span>
                        <span className="text-right">
                          {criterion.maxScore} - Excellent
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label 
                        htmlFor={`comments-${criterion.id}`}
                        className="block text-sm font-medium mb-1"
                      >
                        Comments (optional)
                      </label>
                      <textarea
                        id={`comments-${criterion.id}`}
                        rows={2}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        placeholder="Add specific feedback for this criterion"
                        value={evaluations[criterion.id]?.comments || ''}
                        onChange={(e) => 
                          handleCommentChange(criterion.id, e.target.value)
                        }
                      />
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-sm">
                        <span>Weighted Score:</span>
                        <span className="font-medium">
                          {((evaluations[criterion.id]?.score || 0) * criterion.weight).toFixed(1)}
                          <span className="text-muted-foreground ml-1">
                            (×{criterion.weight})
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-6 mt-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Score</p>
                      <p className="text-3xl font-bold">
                        {calculateTotalScore().toFixed(1)} / 100
                      </p>
                    </div>
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('criteria')}
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handleSubmitEvaluation}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Submitting...' : 'Submit Evaluation'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
