import { useState } from "react";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import FileUpload from "@/components/FileUpload";
import ResultCard from "@/components/ResultCard";
import Loader from "@/components/Loader";
import { detectVideo } from "@/api/detectionApi";
import { toast } from "sonner";

const VideoDetection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    result: "authentic" | "fake" | "suspicious" | null;
    confidence: number;
    details: string;
  } | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please select a video first");
      return;
    }

    setIsLoading(true);
    try {
      const detectionResult = await detectVideo(file);
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
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <PageHeader
          icon={Video}
          title="Deepfake Detection"
          description="Upload a video to analyze for deepfakes and face manipulation using frame-by-frame CNN analysis."
          gradient="bg-gradient-to-br from-purple-500 to-pink-600"
        />

        <div className="grid gap-8">
          {/* Upload Section */}
          <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Upload Video</h2>
            <FileUpload
              accept="video/*,.mp4,.avi,.mov,.webm"
              onFileSelect={handleFileSelect}
              maxSize={100}
              label="Drop your video here"
              description="Supports MP4, AVI, MOV, WebM up to 100MB"
            />
            
            {/* Preview */}
            {preview && (
              <div className="mt-6 animate-scale-in">
                <p className="text-sm text-muted-foreground mb-3">Preview:</p>
                <div className="relative rounded-xl overflow-hidden border border-border max-w-md mx-auto">
                  <video
                    src={preview}
                    controls
                    className="w-full h-auto max-h-80 bg-muted/20"
                  />
                  {isLoading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm scan-line" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <Loader text="Analyzing video frames for deepfakes..." />
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
              disabled={!file || isLoading}
              variant="hero"
              size="lg"
            >
              {isLoading ? "Analyzing..." : "Analyze Video"}
            </Button>
            {(file || result) && (
              <Button onClick={handleReset} variant="outline" size="lg">
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetection;
