import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type AddDialogProps = {
  title: string;
  children: ReactNode;
  triggerText?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: "default" | "outline";
  fullWidth?: boolean;
  buttonColor?: "default" | "muted" | "secondary";
};

export function AddDialog({
  title,
  children,
  triggerText = "Add",
  open,
  onOpenChange,
  variant = "default",
  fullWidth = false,
  buttonColor = "default",
}: AddDialogProps) {
  const getButtonClasses = () => {
    const baseClasses = cn(
      fullWidth && "w-full",
      buttonColor === "muted" && "bg-muted text-muted-foreground hover:bg-muted/80",
      buttonColor === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80"
    );

    return baseClasses;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={getButtonClasses()}
        >
          <Plus className="w-4 h-4 mr-1" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="pt-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
