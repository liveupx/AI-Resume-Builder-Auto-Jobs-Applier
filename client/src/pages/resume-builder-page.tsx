import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ResumeTemplates, { Template } from "@/components/resume-templates";
import AIEditor from "@/components/resume-builder/ai-editor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ResumeBuilderPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (resume: any) => {
      const res = await apiRequest("POST", "/api/resumes", resume);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      toast({
        title: "Resume Saved",
        description: "Your resume has been saved successfully.",
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Save",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = async (resume: any) => {
    if (!selectedTemplate) return;
    await saveMutation.mutateAsync({
      ...resume,
      templateId: selectedTemplate.id
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => {
          if (selectedTemplate) {
            setSelectedTemplate(null);
          } else {
            navigate("/dashboard");
          }
        }}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {selectedTemplate ? "Back to Templates" : "Back to Dashboard"}
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {selectedTemplate ? "Build Your Resume" : "Choose a Template"}
        </h1>
        <p className="text-muted-foreground">
          {selectedTemplate
            ? "Customize your resume content with AI assistance"
            : "Select a professional template to get started"}
        </p>
      </div>

      {!selectedTemplate ? (
        <ResumeTemplates
          onSelect={setSelectedTemplate}
          selectedId={selectedTemplate?.id}
        />
      ) : (
        <AIEditor onSave={handleSave} />
      )}
    </div>
  );
}