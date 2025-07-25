import {
  FormEventHandler,
  KeyboardEventHandler,
  useEffect,
  useRef,
} from "react";
import { ArrowUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  disabled?: boolean;
};

export default function ChatInput({ value, onChange, onSubmit, disabled }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ajusta altura automáticamente
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      (e.target as HTMLTextAreaElement).form?.requestSubmit();
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-end rounded-4xl px-4 py-2 border bg-card gap-2"
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribí tu pregunta..."
        className="flex-1 resize-none overflow-y-auto max-h-[12rem] text-sm border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent py-3 outline-none"
        rows={1}
      />
      <Button
        type="submit"
        disabled={disabled}
        className="rounded-full w-10 h-10 p-2"
      >
        <ArrowUpIcon className="w-5 h-5" />
      </Button>
    </form>
  );
}
