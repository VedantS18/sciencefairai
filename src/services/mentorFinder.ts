import OpenAI from 'openai';

interface MentorSearchParams {
  researchInterests: string;
  location: string;
  searchRadius: string;
}

export interface MentorSearchResult {
  name: string;
  title: string;
  institution: string;
  department: string;
  expertise: string[];
  profileUrl: string;
  relevanceScore: number;
  location: string;
  researchSummary?: string;
  labName?: string;
  labDescription?: string;
  email?: string; 
}

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

const ASSISTANT_ID = import.meta.env.VITE_OPENAI_ASSISTANT_ID;

export async function searchMentors(params: MentorSearchParams): Promise<MentorSearchResult[]> {
    try {
      // Create a thread
      const thread = await openai.beta.threads.create();
  
      // Add a message to the thread
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Find professors researching ${params.researchInterests} near ${params.location} within ${params.searchRadius} radius.`
      });
  
      // Run the assistant
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: ASSISTANT_ID
      });
  
      // Wait for the response
      let response = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      
      while (response.status !== 'completed') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        response = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }
  
      // Get the messages
      const messages = await openai.beta.threads.messages.list(thread.id);
      
      // Get the last assistant message
      const lastMessage = messages.data
        .filter(message => message.role === 'assistant')[0];
  
      if (!lastMessage) return [];
  
      // Parse the content
      const content = lastMessage.content[0];
      if (content.type !== 'text') return [];
      
      try {
        const mentors: MentorSearchResult[] = JSON.parse(content.text.value);
        return mentors.map(mentor => ({
          ...mentor,
          relevanceScore: calculateRelevanceScore(
            mentor.expertise.join(' ') + ' ' + (mentor.researchSummary || ''),
            params.researchInterests
          ),
          location: params.location
        }));
      } catch (parseError) {
        console.error('Error parsing assistant response:', parseError);
        return [];
      }
  
    } catch (error) {
      console.error('Error searching for mentors:', error);
      return [];
    }
  }

function calculateRelevanceScore(text: string, interests: string): number {
  const keywords = interests.toLowerCase().split(/[,\s]+/);
  const textLower = text.toLowerCase();
  
  let matches = 0;
  keywords.forEach(keyword => {
    if (textLower.includes(keyword)) matches++;
  });
  
  return matches / keywords.length;
}

export function generateEmailTemplate(mentor: MentorSearchResult, studentGoals: string): string {
  return `
Dear ${mentor.name},

I hope this email finds you well. My name is [Your Name], and I am a high school student interested in conducting research in ${mentor.expertise.join(', ')} at ${mentor.institution}. I found your profile while researching faculty members in the ${mentor.department}.

${studentGoals}

I was particularly intrigued by your research in ${mentor.expertise[0]}. I would greatly appreciate the opportunity to learn more about your work and potentially discuss mentorship opportunities.

Thank you for your time.

Best regards,
[Your Name]
`.trim();
}