import { useState, useCallback } from "react";
import { Upload, File, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  accept: string;
  onFileSelect: (file: File) => void;
  maxSize?: number; // in MB
  label?: string;
  description?: string;
}

const FileUpload = ({
  accept,
  onFileSelect,
  maxSize = 50,
  label = "Upload File",
  description = "Drag and drop or click to browse",
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return false;
    }

    const acceptedTypes = accept.split(",").map((t) => t.trim());
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const isValidType = acceptedTypes.some(
      (type) =>
        type === fileExtension ||
        type === file.type ||
        (type.endsWith("/*") && file.type.startsWith(type.replace("/*", "")))
    );

    if (!isValidType) {
      setError("Invalid file type");
      return false;
    }

    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect, maxSize, accept]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer group ${
            isDragging
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full transition-all duration-300 ${
              isDragging ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10"
            }`}>
              <Upload className={`w-8 h-8 transition-colors ${
                isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              }`} />
            </div>
            
            <div>
              <p className="font-medium text-foreground">{label}</p>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Max size: {maxSize}MB • Accepted: {accept}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-xl p-4 animate-scale-in">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/20">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFile}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-destructive animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
