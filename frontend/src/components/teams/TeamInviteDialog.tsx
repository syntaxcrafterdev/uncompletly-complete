import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Copy, Loader2, Check } from 'lucide-react';

export function TeamInviteDialog({
  isOpen,
  onOpenChange,
  teamName,
  inviteCode,
  onGenerateInvite,
  isGenerating,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamName: string;
  inviteCode?: string;
  onGenerateInvite: () => Promise<string>;
  isGenerating: boolean;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);

  const handleCopy = async () => {
    if (!inviteCode) return;
    
    try {
      await navigator.clipboard.writeText(inviteCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleGenerateNew = async () => {
    setIsGeneratingNew(true);
    try {
      await onGenerateInvite();
    } finally {
      setIsGeneratingNew(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to {teamName}</DialogTitle>
          <DialogDescription>
            Share this code with others to let them join your team. The code will expire in 24 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {inviteCode ? (
            <>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="invite-code" className="sr-only">
                    Invite Code
                  </Label>
                  <Input
                    id="invite-code"
                    value={inviteCode}
                    readOnly
                    className="text-center font-mono text-lg font-bold tracking-wider"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="px-3"
                  onClick={handleCopy}
                  disabled={isCopied}
                >
                  <span className="sr-only">Copy</span>
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGenerateNew}
                disabled={isGeneratingNew || isGenerating}
              >
                {isGeneratingNew ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate New Code'
                )}
              </Button>
            </>
          ) : (
            <div className="py-4 text-center">
              <Button
                type="button"
                onClick={handleGenerateNew}
                disabled={isGenerating || isGeneratingNew}
              >
                {isGenerating || isGeneratingNew ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Invite Code...
                  </>
                ) : (
                  'Generate Invite Code'
                )}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
