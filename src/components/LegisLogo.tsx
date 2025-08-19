import { Scale, Sparkles } from "lucide-react";

interface LegisLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const LegisLogo = ({ size = "md", showText = true }: LegisLogoProps) => {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-10 w-10",
  };

  const textSizeClasses = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        {/* Círculo moderno con gradiente sutil */}
        <div
          className={`${sizeClasses[size]} bg-gradient-to-br from-legis-blue-dark to-legis-blue-light rounded-full flex items-center justify-center shadow-sm`}
        >
          <Scale
            className={`${
              size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"
            } text-white`}
          />
        </div>

        {/* Punto de IA minimalista */}
        <div
          className={`absolute -top-0.5 -right-0.5 ${
            size === "sm"
              ? "h-2 w-2"
              : size === "md"
              ? "h-2.5 w-2.5"
              : "h-3 w-3"
          } bg-legis-blue-light rounded-full flex items-center justify-center`}
        >
          <Sparkles
            className={`${
              size === "sm"
                ? "h-1 w-1"
                : size === "md"
                ? "h-1.5 w-1.5"
                : "h-2 w-2"
            } text-white fill-current`}
          />
        </div>
      </div>

      {showText && (
        <div className={`font-semibold ${textSizeClasses[size]}`}>
          <span className="text-legis-blue-dark">Legis</span>
          <span className="text-legis-blue-light font-normal"> AI</span>
        </div>
      )}
    </div>
  );
};

export default LegisLogo;
