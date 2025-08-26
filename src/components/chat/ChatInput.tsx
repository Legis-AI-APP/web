import {
  FormEventHandler,
  KeyboardEventHandler,
  useEffect,
  useRef,
} from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

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
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  // Variants suaves y consistentes
  const upIn: Variants = {
    initial: { opacity: 0, y: 8, filter: "blur(2px)" },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 160, damping: 18 },
    },
  };

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      (e.target as HTMLTextAreaElement).form?.requestSubmit();
    }
  };

  return (
    <motion.form
      onSubmit={onSubmit}
      className="relative w-full"
      initial="initial"
      animate="animate"
      variants={upIn}
      transition={{ delay: 0.05 }}
    >
      <div className="bg-card/60 backdrop-blur-sm border border-border rounded-3xl shadow-sm">
        <div className="relative flex items-end">
          <textarea
            ref={textareaRef}
            placeholder="Escribí tu consulta legal aquí..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex-1 resize-none overflow-y-auto bg-transparent border-0 shadow-none",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "px-5 pr-14 py-3 text-base rounded-3xl",
              "min-h-[48px] max-h-[120px]",
              // Estilos personalizados para la barra de scroll
              "[&::-webkit-scrollbar]:w-1.5",
              "[&::-webkit-scrollbar-track]:bg-transparent",
              "[&::-webkit-scrollbar-thumb]:bg-slate-300/60",
              "[&::-webkit-scrollbar-thumb]:rounded-full",
              "[&::-webkit-scrollbar-thumb]:hover:bg-slate-400/80",
              // Para Firefox
              "[scrollbar-width]:thin",
              "[scrollbar-color]:slate-300/60"
            )}
            disabled={disabled}
            rows={1}
          />
          <div className="absolute right-1.5 bottom-1.5">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9 rounded-full"
                disabled={disabled || !value.trim()}
                aria-label="Enviar"
                asChild={false}
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.form>
  );
}
