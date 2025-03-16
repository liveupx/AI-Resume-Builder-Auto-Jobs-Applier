import OpenAI from "openai";

if (!process.env.XAI_API_KEY) {
  throw new Error("XAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ baseURL: "https://api.x.ai/v1", apiKey: process.env.XAI_API_KEY });

export async function summarizeResume(content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "You are an expert resume writer. Enhance the given resume content while maintaining professionalism and highlighting key achievements."
        },
        {
          role: "user",
          content: content
        }
      ]
    });

    return response.choices[0].message.content;
  } catch (error: any) {
    throw new Error(`Failed to enhance resume: ${error.message}`);
  }
}

export async function suggestSkills(jobDescription: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "Extract relevant skills from the job description. Return them as a comma-separated list."
        },
        {
          role: "user",
          content: jobDescription
        }
      ]
    });

    return response.choices[0].message.content.split(",").map(skill => skill.trim());
  } catch (error: any) {
    throw new Error(`Failed to suggest skills: ${error.message}`);
  }
}

export async function generateJobDescription(title: string, requirements: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "Generate a professional job description based on the title and requirements provided."
        },
        {
          role: "user",
          content: `Title: ${title}\nRequirements: ${requirements}`
        }
      ]
    });

    return response.choices[0].message.content;
  } catch (error: any) {
    throw new Error(`Failed to generate job description: ${error.message}`);
  }
}
