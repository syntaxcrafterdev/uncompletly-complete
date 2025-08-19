import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Calendar } from '@/components/ui/Calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

const eventFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  location: z.string().min(2, 'Location is required'),
  maxParticipants: z.coerce.number().min(1, 'Must have at least 1 participant'),
  eventType: z.enum(['hackathon', 'workshop', 'conference', 'meetup', 'other']),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  tags: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>;
  onSubmit: (data: EventFormValues) => void;
  isLoading?: boolean;
  submitButtonText?: string;
}

export function EventForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitButtonText = 'Create Event',
}: EventFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      eventType: 'hackathon',
      ...defaultValues,
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Event Name</Label>
          <Input
            id="name"
            placeholder="Enter event name"
            {...register('name')}
            error={errors.name?.message}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your event in detail"
            className="min-h-[120px]"
            {...register('description')}
            error={errors.description?.message}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => setValue('startDate', date as Date, { shouldValidate: true })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.startDate && (
              <p className="mt-1 text-sm text-destructive">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div>
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => setValue('endDate', date as Date, { shouldValidate: true })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.endDate && (
              <p className="mt-1 text-sm text-destructive">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter event location or URL"
              {...register('location')}
              error={errors.location?.message}
            />
          </div>

          <div>
            <Label htmlFor="eventType">Event Type</Label>
            <Select
              onValueChange={(value: EventFormValues['eventType']) =>
                setValue('eventType', value, { shouldValidate: true })
              }
              defaultValue={defaultValues?.eventType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hackathon">Hackathon</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="meetup">Meetup</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="maxParticipants">Maximum Participants</Label>
            <Input
              id="maxParticipants"
              type="number"
              min="1"
              {...register('maxParticipants')}
              error={errors.maxParticipants?.message}
            />
          </div>

          <div>
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              {...register('website')}
              error={errors.website?.message}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="tags">Tags (Optional)</Label>
          <Input
            id="tags"
            placeholder="tech, programming, workshop (comma separated)"
            {...register('tags')}
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Add tags to help people find your event
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}
