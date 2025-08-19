import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const roles = [
  { value: 'user', label: 'Participant' },
  { value: 'organizer', label: 'Event Organizer' },
  { value: 'judge', label: 'Judge' },
];

interface RoleSelectProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  onValueChange: (value: 'user' | 'organizer' | 'judge') => void;
  defaultValue?: string;
}

export function RoleSelect({ onValueChange, defaultValue = 'user', ...props }: RoleSelectProps) {
  return (
    <SelectPrimitive.Root onValueChange={onValueChange} defaultValue={defaultValue} {...props}>
      <SelectPrimitive.Trigger
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.Viewport className="p-1">
            {roles.map((role) => (
              <SelectPrimitive.Item
                key={role.value}
                value={role.value}
                className={cn(
                  'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
                  'focus:bg-accent focus:text-accent-foreground',
                  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                )}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <SelectPrimitive.ItemText>{role.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
