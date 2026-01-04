import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  link: string;
  gradient: string;
}

const FeatureCard = ({ icon: Icon, title, description, link, gradient }: FeatureCardProps) => {
  return (
    <Link
      to={link}
      className="group glass rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] hover:border-primary/50 relative overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${gradient}`}
      />
      
      {/* Icon */}
      <div className="relative mb-4">
        <div className={`inline-flex p-4 rounded-xl ${gradient} transition-transform duration-500 group-hover:scale-110`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
      
      {/* Content */}
      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
      
      {/* Arrow indicator */}
      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
        <span>Start Detection</span>
        <span className="text-lg">→</span>
      </div>
    </Link>
  );
};

export default FeatureCard;
