import { useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import FileUpload from "@/components/FileUpload";
import ResultCard from "@/components/ResultCard";
import Loader from "@/components/Loader";
import { detectAudio } from "@/api/detectionApi";
import { toast } from "sonner";

const AudioDetection = () => {
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
      toast.error("Please select an audio file first");
      return;
    }

    setIsLoading(true);
    try {
      const detectionResult = await detectAudio(file);
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
          icon={Mic}
          title="Audio Detection"
          description="Upload an audio file to detect synthetic voices and audio deepfakes using spectrogram-based neural network analysis."
          gradient="bg-gradient-to-br from-orange-500 to-red-600"
        />

        <div className="grid gap-8">
          {/* Upload Section */}
          <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Upload Audio</h2>
            <FileUpload
              accept="audio/*,.wav,.mp3,.ogg,.m4a"
              onFileSelect={handleFileSelect}
              maxSize={50}
              label="Drop your audio file here"
              description="Supports WAV, MP3, OGG, M4A up to 50MB"
            />
            
            {/* Preview */}
            {preview && (
              <div className="mt-6 animate-scale-in">
                <p className="text-sm text-muted-foreground mb-3">Preview:</p>
                <div className="glass rounded-xl p-4">
                  <audio
                    src={preview}
                    controls
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <Loader text="Analyzing audio spectrogram..." />
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
              variant="default"
              size="lg"
            >
              {isLoading ? "Analyzing..." : "Analyze Audio"}
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

export default AudioDetection;
