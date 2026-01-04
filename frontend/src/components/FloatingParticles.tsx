import { Shield, Lock, Cpu, Binary } from "lucide-react";

const particles = [
  { icon: Shield, size: 20, left: "10%", top: "20%", delay: 0, duration: 6 },
  { icon: Lock, size: 16, left: "85%", top: "15%", delay: 1, duration: 8 },
  { icon: Cpu, size: 18, left: "75%", top: "70%", delay: 2, duration: 7 },
  { icon: Binary, size: 14, left: "20%", top: "75%", delay: 0.5, duration: 9 },
  { icon: Shield, size: 12, left: "50%", top: "10%", delay: 3, duration: 6 },
  { icon: Lock, size: 22, left: "5%", top: "50%", delay: 1.5, duration: 8 },
  { icon: Cpu, size: 16, left: "90%", top: "45%", delay: 2.5, duration: 7 },
  { icon: Binary, size: 18, left: "40%", top: "85%", delay: 0.8, duration: 9 },
];

const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute animate-float"
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          <particle.icon
            size={particle.size}
            className="text-primary/20"
          />
        </div>
      ))}
      
      {/* Glowing orbs */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`orb-${i}`}
          className="absolute rounded-full animate-pulse-glow"
          style={{
            width: `${8 + i * 4}px`,
            height: `${8 + i * 4}px`,
            left: `${15 + i * 20}%`,
            top: `${30 + (i % 3) * 20}%`,
            background: `radial-gradient(circle, hsl(var(--primary) / 0.4), transparent)`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
