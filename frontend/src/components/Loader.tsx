import { Shield } from "lucide-react";

interface LoaderProps {
  text?: string;
}

const Loader = ({ text = "Analyzing..." }: LoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6">
      {/* Animated Shield */}
      <div className="relative">
        <div className="absolute inset-0 blur-2xl bg-primary/30 animate-pulse" />
        <div className="relative p-6 rounded-full bg-card border border-primary/30 pulse-glow">
          <Shield className="w-12 h-12 text-primary animate-pulse" />
        </div>
        
        {/* Scanning ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
      </div>
      
      {/* Text */}
      <div className="text-center">
        <p className="text-lg font-medium text-foreground">{text}</p>
        <p className="text-sm text-muted-foreground mt-1 font-mono">
          Processing data through AI model
        </p>
      </div>
      
      {/* Progress dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default Loader;
