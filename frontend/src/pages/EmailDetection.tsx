import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/PageHeader";
import ResultCard from "@/components/ResultCard";
import Loader from "@/components/Loader";
import { detectEmailPlain } from "@/api/detectionApi";
import { toast } from "sonner";

const EmailDetection = () => {
  const [emailContent, setEmailContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    result: "authentic" | "fake" | "suspicious" | null;
    confidence: number;
    details: string;
  } | null>(null);

  const handleAnalyze = async () => {
    if (!emailContent.trim()) {
      toast.error("Please enter email content");
      return;
    }

    if (emailContent.trim().length < 20) {
      toast.error("Please enter more email content for accurate analysis");
      return;
    }

    setIsLoading(true);
    try {
      const detectionResult = await detectEmailPlain(emailContent);
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
    setEmailContent("");
    setResult(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <PageHeader
          icon={Mail}
          title="Email Verification"
          description="Paste email content to detect AI-generated text, phishing attempts, and suspicious patterns using NLP analysis."
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
        />

        <div className="grid gap-8">
          {/* Input Section */}
          <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Email Content</h2>
            <Textarea
              placeholder="Paste the full email text here, including subject line and body..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              className="min-h-[200px] bg-muted/30 border-border focus:border-primary resize-none"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Enter the full email text for best results</span>
              <span>{emailContent.length} characters</span>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <Loader text="Analyzing email with NLP models..." />
            </div>
          )}

          {/* Results */}
          {!isLoading && result && (
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <ResultCard
                result={result.result}
                confidence={result.confidence}
                details={result.details}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button
              onClick={handleAnalyze}
              disabled={!emailContent.trim() || isLoading}
              variant="hero"
              size="lg"
            >
              {isLoading ? "Analyzing..." : "Analyze Email"}
            </Button>
            {(emailContent || result) && (
              <Button onClick={handleReset} variant="secondary" size="lg">
                Reset
              </Button>
            )}
          </div>

          {/* AI Email Indicators */}
          <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-lg font-semibold text-foreground mb-4">AI-Generated Email Indicators</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {[
                "Overly formal or generic language",
                "Lack of personal details or context",
                "Perfect grammar with robotic tone",
                "Repetitive sentence structures",
                "Urgent calls to action",
                "Suspicious sender claims",
              ].map((indicator, index) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
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

export default EmailDetection;








