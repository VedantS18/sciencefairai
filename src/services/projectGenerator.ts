// src/lib/projectGenerator.ts
// or src/services/projectGenerator.ts

import OpenAI from 'openai';

interface ProjectFormData {
  interests: string;
  gradeLevel: string;
  fieldOfStudy: string;
  resources: {
    labAccess: boolean;
    specialEquipment: boolean;
    highBudget: boolean;
  };
}

export interface GeneratedProject {
  title: string;
  description: string;
  hypothesis: string;
  materials: string[];
  procedure: string[];
  expectedOutcome: string;
  difficulty: string;
  timeRequired: string;
  safetyNotes: string;
}

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

export async function generateProjectIdea(formData: ProjectFormData): Promise<GeneratedProject> {
  const prompt = `Generate a detailed science fair project idea based on the following criteria:
  - Interest Area: ${formData.interests}
  - Grade Level: ${formData.gradeLevel}
  - Field of Study: ${formData.fieldOfStudy}
  - Available Resources: ${Object.entries(formData.resources)
    .filter(([_, value]) => value)
    .map(([key]) => key)
    .join(', ')}

  Please provide a response in the following format:
  {
    "title": "Project title",
    "description": "Brief project description",
    "hypothesis": "The hypothesis to test",
    "materials": ["List of required materials"],
    "procedure": ["Step-by-step procedure"],
    "expectedOutcome": "What to expect",
    "difficulty": "Beginner/Intermediate/Advanced",
    "timeRequired": "Estimated time to complete",
    "safetyNotes": "Any safety considerations"
  }`;

  try {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Changed from "gpt-4"
        messages: [
          {
            role: "system",
            content: "You are a helpful science teacher assisting students with science fair projects."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error generating project idea:', error);
    throw error;
  }
}