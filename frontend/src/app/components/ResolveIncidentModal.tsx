import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Loader2 } from "lucide-react";

type ResolveIncidentData = {
  finalRootCause: string;
  resolutionStep: string;
};

type ResolveIncidentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (data: ResolveIncidentData) => void;
};

export function ResolveIncidentModal({
  open,
  onOpenChange,
  onResolve,
}: ResolveIncidentModalProps) {
  const [finalRootCause, setFinalRootCause] = useState("");
  const [resolutionStep, setResolutionStep] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!finalRootCause.trim() || !resolutionStep.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onResolve({ finalRootCause, resolutionStep });
      setIsSubmitting(false);
      setFinalRootCause("");
      setResolutionStep("");
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Resolve Incident</DialogTitle>
          <DialogDescription>
            Please provide the final root cause and resolution steps before marking this incident as resolved.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="finalRootCause">
                Final Root Cause <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="finalRootCause"
                placeholder="Describe the root cause of this incident..."
                value={finalRootCause}
                onChange={(e) => setFinalRootCause(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolutionStep">
                Resolution Step <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="resolutionStep"
                placeholder="Describe the steps taken to resolve this incident..."
                value={resolutionStep}
                onChange={(e) => setResolutionStep(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !finalRootCause.trim() || !resolutionStep.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resolving...
                </>
              ) : (
                "Mark as Resolved"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
