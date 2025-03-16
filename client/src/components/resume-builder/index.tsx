import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ResumeBuilderProps {
  template: string;
  onSave: (resume: any) => void;
}

export default function ResumeBuilder({ template, onSave }: ResumeBuilderProps) {
  const { toast } = useToast();
  const [sections, setSections] = useState([
    { id: "summary", title: "Professional Summary", content: "" },
    { id: "experience", title: "Work Experience", content: "" },
    { id: "education", title: "Education", content: "" },
    { id: "skills", title: "Skills", content: "" },
  ]);

  const form = useForm({
    defaultValues: {
      title: "",
      sections: sections.reduce((acc, section) => ({
        ...acc,
        [section.id]: "",
      }), {}),
    },
  });

  const enhanceMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/enhance-resume", { content });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Content Enhanced",
        description: "AI has improved your resume content",
      });
      return data.enhanced;
    },
    onError: (error) => {
      toast({
        title: "Enhancement Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEnhance = async (sectionId: string, content: string) => {
    const enhanced = await enhanceMutation.mutateAsync(content);
    form.setValue(`sections.${sectionId}`, enhanced);
  };

  const addSection = () => {
    const newSection = {
      id: `custom-${Date.now()}`,
      title: "Custom Section",
      content: "",
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const onSubmit = form.handleSubmit((data) => {
    onSave({
      ...data,
      template,
      content: JSON.stringify(data.sections),
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Input
        {...form.register("title")}
        placeholder="Resume Title"
        className="text-2xl font-bold"
      />

      {sections.map((section) => (
        <Card key={section.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Input
                value={section.title}
                onChange={(e) => {
                  const newSections = sections.map((s) =>
                    s.id === section.id ? { ...s, title: e.target.value } : s
                  );
                  setSections(newSections);
                }}
                className="text-lg font-semibold"
              />
              {section.id.startsWith("custom-") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(section.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Textarea
              {...form.register(`sections.${section.id}`)}
              rows={6}
              className="mb-4"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                handleEnhance(section.id, form.getValues(`sections.${section.id}`))
              }
              disabled={enhanceMutation.isPending}
            >
              {enhanceMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Enhance with AI
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addSection}>
        <Plus className="h-4 w-4 mr-2" />
        Add Section
      </Button>

      <div className="flex justify-end">
        <Button type="submit">Save Resume</Button>
      </div>
    </form>
  );
}
