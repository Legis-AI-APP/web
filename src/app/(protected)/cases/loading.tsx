import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Loader className="animate-spin w-8 h-8" />
    </div>
  );
}
