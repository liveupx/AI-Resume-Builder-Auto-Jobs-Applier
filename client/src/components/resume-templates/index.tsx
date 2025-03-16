import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type Template = {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  location: string;
  userCount: number;
  downloadFormats: string[];
};

const templates: Template[] = [
  {
    id: "shanghai",
    name: "Shanghai Professional",
    thumbnail: "/templates/shanghai-template.png",
    description: "A modern template popular in the Asian market",
    location: "Shanghai",
    userCount: 2800000,
    downloadFormats: ["PDF", "DOCX"],
  },
  {
    id: "toronto",
    name: "Toronto Executive",
    thumbnail: "/templates/toronto-template.png",
    description: "Perfect for North American job market",
    location: "Toronto",
    userCount: 2800000,
    downloadFormats: ["PDF", "DOCX"],
  },
  {
    id: "stockholm",
    name: "Stockholm Creative",
    thumbnail: "/templates/stockholm-template.png",
    description: "Stand out in the European market",
    location: "Stockholm 🇸🇪",
    userCount: 10000000,
    downloadFormats: ["PDF", "DOCX"],
  },
  {
    id: "newyork",
    name: "New York Standard",
    thumbnail: "/templates/newyork-template.png",
    description: "Classic template for US corporate roles",
    location: "New York",
    userCount: 4600000,
    downloadFormats: ["PDF", "DOCX"],
  },
];

interface ResumeTemplatesProps {
  onSelect: (template: Template) => void;
  selectedId?: string;
}

export default function ResumeTemplates({ onSelect, selectedId }: ResumeTemplatesProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Choose template</h2>
        <p className="text-muted-foreground">
          Select from our professionally designed templates
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`group cursor-pointer transition-all hover:shadow-lg ${
              selectedId === template.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onSelect(template)}
          >
            <CardContent className="p-4 space-y-4">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white font-medium">{template.location}</p>
                  <p className="text-white/80 text-sm">
                    {template.userCount.toLocaleString()}+ users chose this template
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {template.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  {template.downloadFormats.map((format) => (
                    <Badge key={format} variant="secondary">
                      {format}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant={selectedId === template.id ? "default" : "outline"}
                  className="w-full"
                  onClick={() => onSelect(template)}
                >
                  {selectedId === template.id ? "Selected" : "Use Template"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}