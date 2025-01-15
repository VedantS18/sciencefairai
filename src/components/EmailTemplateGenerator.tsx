import React, { useState } from 'react';
import OpenAI from 'openai';

export interface MentorSearchResult {
  name?: string;
  email?: string;
  expertise?: string[];
  institution?: string;
  labName?: string;
  researchSummary?: string;
}

interface EmailTemplateGeneratorProps {
  mentor: MentorSearchResult;
  studentGoals: string;
  onClose: () => void;
  onEmailGenerated?: (email: string) => void;
  userResume?: string;
}

const EmailTemplateGenerator: React.FC<EmailTemplateGeneratorProps> = ({
  mentor,
  studentGoals,
  onClose,
  onEmailGenerated,
  userResume,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);

  const generateEmailWithAssistant = async () => {
    // Validate environment variables
    const RESEARCH_EMAIL_API_KEY = import.meta.env.VITE_RESEARCH_EMAIL_API_KEY;
    const RESEARCH_EMAIL_ASSISTANT_ID = import.meta.env.VITE_RESEARCH_EMAIL_ASSISTANT_ID;

    if (!RESEARCH_EMAIL_API_KEY) {
      setError('OpenAI API Key is not configured');
      return;
    }

    if (!RESEARCH_EMAIL_ASSISTANT_ID) {
      setError('OpenAI Assistant ID is not configured');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedEmail(null);

    try {
      const openai = new OpenAI({
        apiKey: RESEARCH_EMAIL_API_KEY,
        dangerouslyAllowBrowser: true
      });

      // Create a thread
      const thread = await openai.beta.threads.create();

      // Prepare the context message with error handling for undefined values
      const contextMessage = `
Context for Email Generation:

Mentor Details:
- Name: ${mentor?.name || 'Professor'}
- Institution: ${mentor?.institution || 'Not specified'}
- Research Expertise: ${mentor?.expertise?.join(', ') || 'Not specified'}
- Research Summary: ${mentor?.researchSummary || 'Not specified'}
- Lab Name: ${mentor?.labName || 'Not specified'}

Student Details:
- Outreach Goals: ${studentGoals || 'Not specified'}
${userResume ? `- Resume: ${userResume}` : ''}

Task: Generate a personalized, professional research mentorship request email.
      `.trim();

      // Add message to thread with error handling
      const message = await openai.beta.threads.messages.create(
        thread.id,
        { role: 'user', content: contextMessage }
      ).catch(err => {
        throw new Error(`Failed to create message: ${err.message}`);
      });

      // Run the assistant with error handling
      const run = await openai.beta.threads.runs.create(
        thread.id,
        { assistant_id: RESEARCH_EMAIL_ASSISTANT_ID }
      ).catch(err => {
        throw new Error(`Failed to create run: ${err.message}`);
      });

      // Poll for completion with timeout
      let runStatus;
      const startTime = Date.now();
      const TIMEOUT_MS = 60000; // 1 minute timeout

      while (true) {
        if (Date.now() - startTime > TIMEOUT_MS) {
          throw new Error('Email generation timed out');
        }

        runStatus = await openai.beta.threads.runs.retrieve(
          thread.id,
          run.id
        ).catch(err => {
          throw new Error(`Failed to retrieve run status: ${err.message}`);
        });

        if (runStatus.status === 'completed') break;
        if (runStatus.status === 'failed') {
          throw new Error(`Run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
        }
        if (runStatus.status === 'expired') {
          throw new Error('Run expired');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Retrieve messages with error handling
      const messages = await openai.beta.threads.messages.list(
        thread.id
      ).catch(err => {
        throw new Error(`Failed to retrieve messages: ${err.message}`);
      });

      const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
      
      if (!assistantMessage) {
        throw new Error('No response generated');
      }

      const textContent = assistantMessage.content.find(content => content.type === 'text');
      
      if (!textContent || textContent.type !== 'text') {
        throw new Error('Invalid response format');
      }

      const email = textContent.text.value.trim();
      
      if (!email) {
        throw new Error('Empty email generated');
      }

      setGeneratedEmail(email);
      if (onEmailGenerated) {
        onEmailGenerated(email);
      }

      // Clean up
      await openai.beta.threads.del(thread.id).catch(console.error);

    } catch (err) {
      console.error('Email generation error:', err);
      setError(`Failed to generate email: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Rest of the component remains the same...
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Email Template Generation</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-center mb-4">
          <button
            onClick={generateEmailWithAssistant}
            disabled={isGenerating}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg 
                       hover:bg-primary/80 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate Email with AI'}
          </button>
        </div>

        {generatedEmail && (
          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2">Generated Email:</h4>
            <textarea
              className="w-full h-64 p-4 rounded-lg border border-input bg-background text-foreground"
              value={generatedEmail}
              readOnly
            />
            <div className="flex justify-end mt-2 space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedEmail);
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
              >
                Copy to Clipboard
              </button>
              {mentor.email && (
                <button
                  onClick={() => {
                    const subject = encodeURIComponent('Research Mentorship Inquiry');
                    const body = encodeURIComponent(generatedEmail);
                    window.location.href = `mailto:${mentor.email}?subject=${subject}&body=${body}`;
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80"
                >
                  Open in Email Client
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTemplateGenerator;