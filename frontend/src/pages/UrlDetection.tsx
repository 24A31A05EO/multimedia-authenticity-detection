import { useState } from "react";
import { Link as LinkIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/PageHeader";
import ResultCard from "@/components/ResultCard";
import Loader from "@/components/Loader";
import { detectUrl } from "@/api/detectionApi";
import { toast } from "sonner";

const UrlDetection = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    result: "authentic" | "fake" | "suspicious" | null;
    confidence: number;
    details: string;
  } | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    try {
      const detectionResult = await detectUrl(url);
      setResult(detectionResult);
      toast.success("Analysis complete!");
    } catch (error) {
      toast.error("Analysis failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setResult(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <PageHeader
          icon={LinkIcon}
          title="Phishing Detection"
          description="Enter a URL to analyze for phishing patterns, malicious indicators, and domain reputation using ML feature extraction."
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
        />

        <div className="grid gap-8">
          {/* Input Section */}
          <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Enter URL</h2>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="https://example.com/path"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 bg-muted/30 border-border focus:border-primary"
                />
              </div>
            </div>
            
            {/* URL Preview */}
            {url && (
              <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border font-mono text-sm text-muted-foreground truncate animate-fade-in">
                {url}
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <Loader text="Analyzing URL for phishing patterns..." />
            </div>
          )}

          {/* Results */}
          {!isLoading && (
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <ResultCard
                result={result?.result || null}
                confidence={result?.confidence || 0}
                details={result?.details}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button
              onClick={handleAnalyze}
              disabled={!url.trim() || isLoading}
              variant="hero"
              size="lg"
            >
              {isLoading ? "Analyzing..." : "Analyze URL"}
            </Button>
            {(url || result) && (
              <Button onClick={handleReset} variant="outline" size="lg">
                Reset
              </Button>
            )}
          </div>

          {/* Common Phishing Indicators */}
          <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-lg font-semibold text-foreground mb-4">Common Phishing Indicators</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {[
                "Misspelled domain names (e.g., g00gle.com)",
                "Unusual TLDs (.xyz, .tk, .ml)",
                "Excessive subdomains",
                "IP addresses instead of domain names",
                "Suspicious URL parameters",
                "Known phishing URL patterns",
              ].map((indicator, index) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                  {indicator}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlDetection;
