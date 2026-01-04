import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Image, Video, Mic, Link as LinkIcon, Mail, Activity, Shield, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

const detectionModules = [
  { icon: Image, title: "Image Detection", link: "/image", description: "Detect AI-generated and manipulated images", color: "text-cyan-400", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/30" },
  { icon: Video, title: "Video Detection", link: "/video", description: "Analyze videos for deepfakes", color: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30" },
  { icon: Mic, title: "Audio Detection", link: "/audio", description: "Identify synthetic audio", color: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30" },
  { icon: LinkIcon, title: "URL Detection", link: "/url", description: "Check URLs for phishing", color: "text-green-400", bgColor: "bg-green-500/10", borderColor: "border-green-500/30" },
  { icon: Mail, title: "Email Detection", link: "/email", description: "Verify email authenticity", color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
];

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, fakes: 0, accuracy: 100 });

  const fetchStats = async () => {
    const { data, error } = await supabase.from("detections").select("*");
    if (!error && data) {
      const total = data.length;
      const fakes = data.filter(d => d.result === "fake").length;
      const accuracy = total ? ((total - fakes) / total) * 100 : 100;
      setStats({ total, fakes, accuracy: parseFloat(accuracy.toFixed(1)) });
    }
  };

  useEffect(() => {
    fetchStats();

    const subscription = supabase
      .channel("realtime:detections")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "detections" }, () => fetchStats())
      .subscribe();

    return () => {
      void supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-12">Select a detection module to analyze content authenticity.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Total Scans", value: stats.total, icon: Activity },
          { label: "Fakes Detected", value: stats.fakes, icon: Shield },
          { label: "Accuracy Rate", value: stats.accuracy + "%", icon: TrendingUp },
        ].map((stat) => (
          <Card key={stat.label} className="glass border-border/50">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold font-mono gradient-text">{stat.value}</p>
              </div>
              <stat.icon className="w-6 h-6 text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {detectionModules.map((module) => (
          <Link key={module.title} to={module.link}>
            <Card className={`glass border ${module.borderColor} hover:scale-[1.02] transition-all duration-300 cursor-pointer group h-full`}>
              <CardContent className="p-6">
                <div className={`inline-flex p-4 rounded-xl ${module.bgColor} mb-4 group-hover:scale-110`}>
                  <module.icon className={`w-8 h-8 ${module.color}`} />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary">{module.title}</h3>
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;




