import { Link } from "react-router-dom";
import { Shield, Image, Video, Mic, Link as LinkIcon, Mail, ArrowRight, Zap, Lock, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/FeatureCard";
import FloatingParticles from "@/components/FloatingParticles";
import heroImage from "@/assets/hero-security.png";

const features = [
  {
    icon: Image,
    title: "Image Detection",
    description: "Detect AI-generated and manipulated images using advanced CNN models trained on FaceForensics++ dataset.",
    link: "/image",
    gradient: "bg-gradient-to-br from-cyan-500 to-blue-600",
  },
  {
    icon: Video,
    title: "Deepfake Detection",
    description: "Analyze videos frame-by-frame to identify deepfakes and face-swap manipulations.",
    link: "/video",
    gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
  },
  {
    icon: Mic,
    title: "Audio Analysis",
    description: "Detect synthetic voices and audio deepfakes using spectrogram-based neural networks.",
    link: "/audio",
    gradient: "bg-gradient-to-br from-orange-500 to-red-600",
  },
  {
    icon: LinkIcon,
    title: "Phishing Detection",
    description: "Analyze URLs for phishing patterns and malicious indicators using ML feature extraction.",
    link: "/url",
    gradient: "bg-gradient-to-br from-green-500 to-emerald-600",
  },
  {
    icon: Mail,
    title: "Email Verification",
    description: "Identify AI-generated emails and phishing attempts using NLP analysis.",
    link: "/email",
    gradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
  },
];

const stats = [
  { value: "99.2%", label: "Detection Accuracy" },
  { value: "<2s", label: "Analysis Time" },
  { value: "5+", label: "Detection Types" },
  { value: "100%", label: "Open Source" },
];

const Home = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="AI Security Visualization" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>
        <div className="absolute inset-0 grid-bg opacity-30" />
        <FloatingParticles />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/30 mb-8 animate-fade-in">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Powered by TensorFlow AI Models
              </span>
            </div>
            
            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <span className="text-foreground">Multimedia</span>
              <br />
              <span className="gradient-text">Authenticity</span>
              <br />
              <span className="text-foreground">Detection System</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Advanced AI-powered detection for fake images, deepfakes, synthetic audio, 
              phishing URLs, and AI-generated emails. Fully local, free, and open-source.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button asChild variant="hero" size="xl">
                <Link to="/dashboard">
                  Start Detection
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="text-4xl md:text-5xl font-bold gradient-text font-mono mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complete Detection Suite
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Five powerful AI modules working together to protect you from digital deception.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-32 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple three-step process for instant authenticity verification.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                icon: Cpu,
                title: "Upload Content",
                description: "Upload your image, video, audio file, paste a URL, or enter email text.",
              },
              {
                step: "02",
                icon: Shield,
                title: "AI Analysis",
                description: "Our TensorFlow models analyze the content for signs of manipulation.",
              },
              {
                step: "03",
                icon: Lock,
                title: "Get Results",
                description: "Receive a detailed authenticity report with confidence scores.",
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="relative inline-flex mb-6">
                  <div className="p-5 rounded-2xl glass">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
            <div className="relative">
              <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Verify Authenticity?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Start detecting fake content now. No signup required. 100% free and private.
              </p>
              <Button asChild variant="hero" size="xl">
                <Link to="/dashboard">
                  Launch Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm text-muted-foreground">
                MADS v1.0.0
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Open-source fake detection system. Built with TensorFlow.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
