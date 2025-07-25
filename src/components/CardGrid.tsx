import { ReactNode } from "react";

export default function CardGrid({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-4">{children}</div>;
}
