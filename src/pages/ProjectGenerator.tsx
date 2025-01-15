import React, { useState } from "react";
import DarkModeToggle from '../components/ui/DarkModeToggle';
import { generateProjectIdea, type GeneratedProject } from '../services/projectGenerator';

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

const ProjectGenerator: React.FC = () => {
  const [formData, setFormData] = useState<ProjectFormData>({
    interests: "",
    gradeLevel: "",
    fieldOfStudy: "",
    resources: {
      labAccess: false,
      specialEquipment: false,
      highBudget: false,
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState<GeneratedProject | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        [name]: checked
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await generateProjectIdea(formData);
      setGeneratedIdea(response);
    } catch (error) {
      console.error('Error generating idea:', error);
    } finally {
      setIsLoading(false);
    }
  };

  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>

      <div className="text-center pt-8">
        <h1 className="text-5xl font-bold mb-4 text-primary">Project Generator</h1>
        <p className="text-lg text-secondary-foreground">
          Get personalized science fair project ideas based on your interests and requirements.
        </p>
      </div>

      <div className="flex flex-row gap-8 p-8 max-w-7xl mx-auto">
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form fields remain the same */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="interests" className="text-foreground font-medium">
                Areas of Interest
              </label>
              <input
                type="text"
                id="interests"
                name="interests"
                value={formData.interests}
                onChange={handleInputChange}
                placeholder="e.g., renewable energy, robotics"
                className="px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                required
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="gradeLevel" className="text-foreground font-medium">
                Grade Level
              </label>
              <select
                id="gradeLevel"
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleInputChange}
                className="px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                required
              >
                <option value="">Select your grade</option>
                <option value="9">9th Grade</option>
                <option value="10">10th Grade</option>
                <option value="11">11th Grade</option>
                <option value="12">12th Grade</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="fieldOfStudy" className="text-foreground font-medium">
                Field of Study
              </label>
              <select
                id="fieldOfStudy"
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleInputChange}
                className="px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                required
              >
                <option value="">Select a field</option>
                <option value="biology">Biology</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="engineering">Engineering</option>
                <option value="environmental">Environmental Science</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-foreground font-medium">Available Resources</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="labAccess"
                    name="labAccess"
                    checked={formData.resources.labAccess}
                    onChange={handleCheckboxChange}
                    className="rounded border-input"
                  />
                  <label htmlFor="labAccess">Lab Access</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="specialEquipment"
                    name="specialEquipment"
                    checked={formData.resources.specialEquipment}
                    onChange={handleCheckboxChange}
                    className="rounded border-input"
                  />
                  <label htmlFor="specialEquipment">Special Equipment</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="highBudget"
                    name="highBudget"
                    checked={formData.resources.highBudget}
                    onChange={handleCheckboxChange}
                    className="rounded border-input"
                  />
                  <label htmlFor="highBudget">Budget Over $100</label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg 
                       hover:bg-primary/80 transition-colors 
                       focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Generating..." : "Generate Project Ideas"}
            </button>
          </form>
        </div>

        <div className="flex-1 flex items-start justify-center">
          {generatedIdea ? (
            <div className="p-6 bg-secondary rounded-lg w-full">
              <h2 className="text-2xl font-bold mb-6 text-primary">{generatedIdea.title}</h2>
              
              <div className="space-y-4">
                <section>
                  <h3 className="text-lg font-semibold text-primary mb-2">Description</h3>
                  <p className="text-foreground">{generatedIdea.description}</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-primary mb-2">Hypothesis</h3>
                  <p className="text-foreground">{generatedIdea.hypothesis}</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-primary mb-2">Materials Needed</h3>
                  <ul className="list-disc pl-5 text-foreground">
                    {generatedIdea.materials.map((material, index) => (
                      <li key={index}>{material}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-primary mb-2">Procedure</h3>
                  <ol className="list-decimal pl-5 text-foreground">
                    {generatedIdea.procedure.map((step, index) => (
                      <li key={index} className="mb-1">{step}</li>
                    ))}
                  </ol>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-primary mb-2">Expected Outcome</h3>
                  <p className="text-foreground">{generatedIdea.expectedOutcome}</p>
                </section>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="p-3 bg-background rounded-lg">
                    <h4 className="font-medium text-primary">Difficulty</h4>
                    <p className="text-foreground">{generatedIdea.difficulty}</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <h4 className="font-medium text-primary">Time Required</h4>
                    <p className="text-foreground">{generatedIdea.timeRequired}</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <h4 className="font-medium text-primary">Safety Notes</h4>
                    <p className="text-foreground">{generatedIdea.safetyNotes}</p>
                  </div>
                </div>

                <button
                  onClick={() => setGeneratedIdea(null)}
                  className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg 
                           hover:bg-primary/80 transition-colors w-full"
                >
                  Generate Another Project
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-secondary/50 rounded-lg w-full text-center">
              <p className="text-muted-foreground">
                Fill out the form and click "Generate" to see your personalized project idea!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectGenerator;