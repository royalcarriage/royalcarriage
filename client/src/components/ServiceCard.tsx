import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export function ServiceCard({ title, description, href, icon }: ServiceCardProps) {
  return (
    <Link href={href}>
      <Card 
        className="group h-full transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg cursor-pointer"
        data-testid={`card-service-${title.toLowerCase().replace(/\s/g, "-")}`}
      >
        <CardContent className="p-6">
          <div className="w-12 h-12 rounded-lg bg-foreground/5 flex items-center justify-center mb-4 group-hover:bg-foreground/10 transition-colors">
            {icon}
          </div>
          <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">{description}</p>
          <div className="flex items-center gap-2 text-foreground font-medium text-sm group-hover:gap-3 transition-all">
            Learn More
            <ArrowRight className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
