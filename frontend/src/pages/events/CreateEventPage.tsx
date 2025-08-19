import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EventForm } from '@/components/events/EventForm';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/config/api';

export function CreateEventPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      // Format data before sending
      const formattedData = {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
      };

      await api.post('/events', formattedData);
      
      toast({
        title: 'Success!',
        description: 'Event created successfully',
        variant: 'default',
      });
      
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Event</CardTitle>
          </CardHeader>
          <CardContent>
            <EventForm 
              onSubmit={handleSubmit} 
              isLoading={isLoading}
              submitButtonText="Create Event"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
