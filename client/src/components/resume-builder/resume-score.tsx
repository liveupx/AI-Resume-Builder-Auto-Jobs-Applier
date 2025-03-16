import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ScoreCategory {
  name: string;
  score: number;
  count: number;
  total: number;
}

interface ResumeScoreProps {
  content: string;
}

export default function ResumeScore({ content }: ResumeScoreProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState<{
    total: number;
    categories: ScoreCategory[];
    suggestions: string[];
  }>({
    total: 0,
    categories: [],
    suggestions: [],
  });

  useEffect(() => {
    const analyzeResume = async () => {
      setIsAnalyzing(true);
      try {
        const response = await fetch("/api/analyze-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        const data = await response.json();
        setScore(data);
      } catch (error) {
        console.error("Failed to analyze resume:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    if (content) {
      analyzeResume();
    }
  }, [content]);

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Resume Score</h3>
          <div className="flex items-center gap-4">
            <Progress value={score.total} className="flex-1" />
            <span className="font-medium">{score.total}/100</span>
          </div>
        </div>

        <div className="space-y-4">
          {score.categories.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{category.name}</span>
                <span className="text-muted-foreground">
                  {category.count}/{category.total}
                </span>
              </div>
              <Progress value={(category.count / category.total) * 100} />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Suggestions</h4>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {score.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted"
                >
                  {suggestion.startsWith("✓") ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  )}
                  <p>{suggestion}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
