import { useState } from "react";
import { Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import FileUpload from "@/components/FileUpload";
import ResultCard from "@/components/ResultCard";
import Loader from "@/components/Loader";
import { detectImage } from "@/api/detectionApi";
import { toast } from "sonner";

const ImageDetection = () => {
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
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please select an image first");
      return;
    }

    setIsLoading(true);
    try {
      const detectionResult = await detectImage(file);
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
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <PageHeader
          icon={Image}
          title="Image Detection"
          description="Upload an image to detect AI-generated content, deepfakes, and digital manipulations using our CNN-based detection model."
          gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
        />

        <div className="grid gap-8">
          {/* Upload Section */}
          <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Upload Image</h2>
            <FileUpload
              accept="image/*,.jpg,.jpeg,.png,.webp"
              onFileSelect={handleFileSelect}
              maxSize={20}
              label="Drop your image here"
              description="Supports JPG, PNG, WebP up to 20MB"
            />
            
            {/* Preview */}
            {preview && (
              <div className="mt-6 animate-scale-in">
                <p className="text-sm text-muted-foreground mb-3">Preview:</p>
                <div className="relative rounded-xl overflow-hidden border border-border max-w-md mx-auto">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-auto max-h-80 object-contain bg-muted/20"
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
              <Loader text="Analyzing image for manipulation..." />
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
              {isLoading ? "Analyzing..." : "Analyze Image"}
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

export default ImageDetection;
