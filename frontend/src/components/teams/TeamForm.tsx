import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Loader2 } from 'lucide-react';

const teamFormSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  description: z.string().optional(),
  maxMembers: z.number().min(2).max(10).default(5),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

interface TeamFormProps {
  defaultValues?: Partial<TeamFormValues>;
  onSubmit: (data: TeamFormValues) => void;
  isLoading?: boolean;
  submitButtonText?: string;
}

export function TeamForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitButtonText = 'Create Team',
}: TeamFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: '',
      description: '',
      maxMembers: 5,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Team Name</Label>
          <Input
            id="name"
            placeholder="Enter team name"
            {...register('name')}
            error={errors.name?.message}
          />
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <textarea
            id="description"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Tell us about your team..."
            {...register('description')}
          />
        </div>

        <div>
          <Label htmlFor="maxMembers">Maximum Team Members</Label>
          <Input
            id="maxMembers"
            type="number"
            min={2}
            max={10}
            {...register('maxMembers', { valueAsNumber: true })}
            error={errors.maxMembers?.message}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Choose how many members can join your team (2-10)
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          submitButtonText
        )}
      </Button>
    </form>
  );
}
