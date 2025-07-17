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

type AddDialogProps = {
  title: string;
  children: ReactNode;
  triggerText?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: "default" | "outline";
};

export function AddDialog({
  title,
  children,
  triggerText = "Add",
  open,
  onOpenChange,
  variant = "default",
}: AddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm">
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
