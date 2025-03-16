import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Wand2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BulletGeneratorProps {
  role: string;
  onSave: (bullet: string) => void;
}

export default function BulletGenerator({ role, onSave }: BulletGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [bullet, setBullet] = useState("");

  const generateBullet = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await response.json();
      setBullet(data.bullet);
    } catch (error) {
      console.error("Failed to generate bullet point:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Generate Bullet Point</h3>
          <Badge variant="secondary">{role}</Badge>
        </div>
        
        <div className="relative">
          <Input
            value={bullet}
            onChange={(e) => setBullet(e.target.value)}
            placeholder="Generate or type your bullet point..."
            className="pr-24"
          />
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={generateBullet}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setBullet("")}>
            Clear
          </Button>
          <Button onClick={() => onSave(bullet)} disabled={!bullet.trim()}>
            Add to Resume
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
