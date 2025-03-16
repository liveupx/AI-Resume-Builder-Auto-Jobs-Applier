import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Grip, Plus, Trash } from "lucide-react";
import BulletGenerator from "./bullet-generator";
import ResumeScore from "./resume-score";

interface Experience {
  id: string;
  role: string;
  company: string;
  date: string;
  bullets: string[];
}

export default function AIEditor() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedExp, setSelectedExp] = useState<string | null>(null);

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      role: "",
      company: "",
      date: "",
      bullets: [],
    };
    setExperiences([...experiences, newExp]);
    setSelectedExp(newExp.id);
  };

  const updateExperience = (id: string, updates: Partial<Experience>) => {
    setExperiences(
      experiences.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      )
    );
  };

  const addBullet = (expId: string, bullet: string) => {
    setExperiences(
      experiences.map((exp) =>
        exp.id === expId
          ? { ...exp, bullets: [...exp.bullets, bullet] }
          : exp
      )
    );
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const expId = result.source.droppableId;
    const experience = experiences.find((e) => e.id === expId);
    if (!experience) return;

    const bullets = Array.from(experience.bullets);
    const [reorderedBullet] = bullets.splice(result.source.index, 1);
    bullets.splice(result.destination.index, 0, reorderedBullet);

    updateExperience(expId, { bullets });
  };

  const getResumeContent = () => {
    return experiences
      .map(
        (exp) =>
          `${exp.role} at ${exp.company}\n${exp.date}\n${exp.bullets.join("\n")}`
      )
      .join("\n\n");
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Experience</h2>
          <Button onClick={addExperience}>
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          {experiences.map((exp) => (
            <Card
              key={exp.id}
              className={`transition-shadow ${
                selectedExp === exp.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedExp(exp.id)}
            >
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Role"
                    value={exp.role}
                    onChange={(e) =>
                      updateExperience(exp.id, { role: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(exp.id, { company: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Date Range"
                    value={exp.date}
                    onChange={(e) =>
                      updateExperience(exp.id, { date: e.target.value })
                    }
                  />
                </div>

                <Droppable droppableId={exp.id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {exp.bullets.map((bullet, index) => (
                        <Draggable
                          key={index}
                          draggableId={`${exp.id}-${index}`}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-start gap-2 group"
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="p-2 rounded hover:bg-muted"
                              >
                                <Grip className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <Textarea
                                value={bullet}
                                onChange={(e) => {
                                  const newBullets = [...exp.bullets];
                                  newBullets[index] = e.target.value;
                                  updateExperience(exp.id, {
                                    bullets: newBullets,
                                  });
                                }}
                                className="flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100"
                                onClick={() => {
                                  const newBullets = exp.bullets.filter(
                                    (_, i) => i !== index
                                  );
                                  updateExperience(exp.id, {
                                    bullets: newBullets,
                                  });
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {selectedExp === exp.id && (
                  <BulletGenerator
                    role={exp.role}
                    onSave={(bullet) => addBullet(exp.id, bullet)}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </DragDropContext>
      </div>

      <div className="space-y-6">
        <ResumeScore content={getResumeContent()} />
      </div>
    </div>
  );
}
