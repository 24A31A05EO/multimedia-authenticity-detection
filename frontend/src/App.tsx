import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ImageDetection from "./pages/ImageDetection";
import VideoDetection from "./pages/VideoDetection";
import AudioDetection from "./pages/AudioDetection";
import UrlDetection from "./pages/UrlDetection";
import EmailDetection from "./pages/EmailDetection";
import BackendTest from "./pages/BackendTest";
import NotFound from "./pages/NotFound";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/image" element={<ImageDetection />} />
          <Route path="/video" element={<VideoDetection />} />
          <Route path="/audio" element={<AudioDetection />} />
          <Route path="/url" element={<UrlDetection />} />
          <Route path="/email" element={<EmailDetection />} />
          <Route path="/backend-test" element={<BackendTest />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
