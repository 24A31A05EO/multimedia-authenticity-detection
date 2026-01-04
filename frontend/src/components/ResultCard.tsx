import { CheckCircle, XCircle, AlertTriangle, Shield } from "lucide-react";

interface ResultCardProps {
  result: "authentic" | "fake" | "suspicious" | null;
  confidence: number;
  details?: string;
  isLoading?: boolean;
}

const ResultCard = ({ result, confidence, details, isLoading }: ResultCardProps) => {
  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass rounded-xl p-6 border-dashed">
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="p-4 rounded-full bg-muted/50">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <p className="font-medium">Awaiting Analysis</p>
            <p className="text-sm">Upload a file to begin detection</p>
          </div>
        </div>
      </div>
    );
  }

  const config = {
    authentic: {
      icon: CheckCircle,
      title: "Authentic",
      subtitle: "No manipulation detected",
      bgClass: "bg-success/10",
      iconClass: "text-success",
      borderClass: "border-success/30",
      glowClass: "glow-success",
    },
    fake: {
      icon: XCircle,
      title: "Fake Detected",
      subtitle: "Signs of manipulation found",
      bgClass: "bg-destructive/10",
      iconClass: "text-destructive",
      borderClass: "border-destructive/30",
      glowClass: "glow-destructive",
    },
    suspicious: {
      icon: AlertTriangle,
      title: "Suspicious",
      subtitle: "Requires further verification",
      bgClass: "bg-warning/10",
      iconClass: "text-warning",
      borderClass: "border-warning/30",
      glowClass: "",
    },
  };

  const { icon: Icon, title, subtitle, bgClass, iconClass, borderClass, glowClass } =
    config[result];

  return (
    <div className={`glass rounded-xl p-6 border ${borderClass} ${glowClass} animate-scale-in`}>
      <div className="flex items-start gap-4">
        <div className={`p-4 rounded-full ${bgClass}`}>
          <Icon className={`w-8 h-8 ${iconClass}`} />
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          
          {/* Confidence Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-mono font-medium">{confidence.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 rounded-full ${
                  result === "authentic"
                    ? "bg-success"
                    : result === "fake"
                    ? "bg-destructive"
                    : "bg-warning"
                }`}
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
          
          {details && (
            <p className="mt-4 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 font-mono">
              {details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
