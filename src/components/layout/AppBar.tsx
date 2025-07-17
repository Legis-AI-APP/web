import { ReactNode } from "react";

type AppBarProps = {
  title: string;
  actions?: ReactNode;
};

export default function AppBar({ title, actions }: AppBarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex gap-2">{actions}</div>
    </div>
  );
}
