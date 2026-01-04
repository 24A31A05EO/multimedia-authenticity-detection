import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

const PageHeader = ({ icon: Icon, title, description, gradient }: PageHeaderProps) => {
  return (
    <div className="text-center mb-12 animate-fade-in">
      <div className="inline-flex mb-6">
        <div className={`p-5 rounded-2xl ${gradient} relative`}>
          <Icon className="w-10 h-10 text-white" />
          <div className="absolute inset-0 blur-xl opacity-50" style={{ background: 'inherit' }} />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
        {title}
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        {description}
      </p>
    </div>
  );
};

export default PageHeader;
