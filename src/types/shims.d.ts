// Temporary module shims to unblock typechecking in environments where
// some packages don't ship/resolve their TypeScript declarations.
//
// Prefer replacing these with proper types or package upgrades.

declare module "framer-motion" {
  export const motion: any;
  export const AnimatePresence: any;
  export type Variants = any;
}

declare module "ai" {
  // Minimal type surface used by our local ai-elements components.
  // Replace with real types by updating the dependency when possible.
  export type ChatStatus = "submitted" | "streaming" | "ready" | "error";

  export type UIMessage = {
    id: string;
    role: "user" | "assistant" | "system" | (string & {});
    content: string;
  };

  export type FileUIPart = {
    type: "file";
    mimeType?: string;
    mediaType?: string;
    filename?: string;
    url?: string;
  };

  export type SourceDocumentUIPart = {
    type: "source";
    title?: string;
    url?: string;
    snippet?: string;
  };
}
