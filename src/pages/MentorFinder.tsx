import React, { useState } from "react";
import DarkModeToggle from '../components/ui/DarkModeToggle';
import { searchMentors, type MentorSearchResult } from '../services/mentorFinder';
import EmailTemplateGenerator from '../components/EmailTemplateGenerator';

interface SearchFormData {
  researchInterests: string;
  location: string;
  outreachGoals: string;
  searchRadius: string;
}

const MentorFinder: React.FC = () => {
  const [formData, setFormData] = useState<SearchFormData>({
    researchInterests: "",
    location: "",
    outreachGoals: "",
    searchRadius: "25"
  });

  // New state for user resume
  const [userResume, setUserResume] = useState<string>('');

  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [allMentors, setAllMentors] = useState<MentorSearchResult[]>([]);
  const [searchResults, setSearchResults] = useState<MentorSearchResult[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<MentorSearchResult | null>(null);
  const [error, setError] = useState<string>("");

  const professorsPerPage = 5;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // New method to handle resume upload
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Read the file content as text
        const fileContent = await file.text();
        setUserResume(fileContent);
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Failed to read the uploaded file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError("");
    setCurrentPage(0);
    
    try {
      const results = await searchMentors({
        researchInterests: formData.researchInterests,
        location: formData.location,
        searchRadius: formData.searchRadius
      });
      setAllMentors(results);
      setSearchResults(results.slice(0, professorsPerPage));
    } catch (error) {
      console.error('Error searching for mentors:', error);
      setError("Failed to find mentors. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    const start = nextPage * professorsPerPage;
    const end = start + professorsPerPage;
    setSearchResults(allMentors.slice(start, end));
    setCurrentPage(nextPage);
  };

  const handlePrevPage = () => {
    const prevPage = currentPage - 1;
    const start = prevPage * professorsPerPage;
    const end = start + professorsPerPage;
    setSearchResults(allMentors.slice(start, end));
    setCurrentPage(prevPage);
  };

  const handleGenerateEmail = (mentor: MentorSearchResult) => {
    setSelectedMentor(mentor);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>

      <div className="text-center pt-8">
        <h1 className="text-5xl font-bold mb-4 text-primary">Research Mentor Finder</h1>
        <p className="text-lg text-secondary-foreground">
          Find and connect with academic mentors in your area of interest
        </p>
      </div>

      <div className="flex flex-row gap-8 p-8 max-w-7xl mx-auto">
        {/* Search Form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col space-y-2">
              <label htmlFor="researchInterests" className="text-foreground font-medium">
                Research Interests
              </label>
              <input
                id="researchInterests"
                name="researchInterests"
                type="text"
                value={formData.researchInterests}
                onChange={handleInputChange}
                placeholder="e.g., aerodynamics, machine learning"
                className="px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                required
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="location" className="text-foreground font-medium">
                Your Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, State"
                className="px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                required
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="searchRadius" className="text-foreground font-medium">
                Search Radius
              </label>
              <select
                id="searchRadius"
                name="searchRadius"
                value={formData.searchRadius}
                onChange={handleInputChange}
                className="px-4 py-2 rounded-lg border border-input bg-background text-foreground"
              >
                <option value="25">25 miles</option>
                <option value="50">50 miles</option>
                <option value="100">100 miles</option>
                <option value="anywhere">Anywhere</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="outreachGoals" className="text-foreground font-medium">
                Goals of Outreach
              </label>
              <textarea
                id="outreachGoals"
                name="outreachGoals"
                value={formData.outreachGoals}
                onChange={handleInputChange}
                placeholder="What are you hoping to learn or achieve through this mentorship?"
                className="px-4 py-2 rounded-lg border border-input bg-background text-foreground h-32"
                required
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="resume" className="text-foreground font-medium">
                Upload Resume (Optional)
              </label>
              <input
                id="resume"
                name="resume"
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="px-4 py-2 rounded-lg border border-input bg-background text-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg 
                       hover:bg-primary/80 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? "Searching..." : "Find Mentors"}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="flex-1">
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {isSearching ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-secondary-foreground">
                Searching for mentors...
              </p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="space-y-4">
              {searchResults.map((mentor) => (
                <div key={mentor.name} className="p-6 bg-secondary rounded-lg">
                    <h3 className="text-xl font-bold text-primary">{mentor.name}</h3>
                    <div className="text-foreground flex flex-col gap-1">
                    <p>{mentor.title} at {mentor.institution}</p>
                    <p className="text-secondary-foreground">{mentor.department}</p>
                    </div>

                    {mentor.expertise && mentor.expertise.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-medium">Research Focus:</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                        {mentor.expertise.map((area) => (
                            <span key={area} className="px-2 py-1 bg-primary/10 rounded-full text-sm">
                            {area}
                            </span>
                        ))}
                        </div>
                    </div>
                    )}

                    {mentor.researchSummary && (
                    <div className="mt-4">
                        <h4 className="font-medium">Current Research:</h4>
                        <p className="text-sm text-secondary-foreground">
                        {mentor.researchSummary}
                        </p>
                    </div>
                    )}

                    {mentor.labName && (
                    <div className="mt-4">
                        <h4 className="font-medium">Research Group:</h4>
                        <p className="font-medium">{mentor.labName}</p>
                        {mentor.labDescription && (
                        <p className="text-sm text-secondary-foreground mt-1">
                            {mentor.labDescription}
                        </p>
                        )}
                    </div>
                    )}
                    {mentor.email && (
                    <div className="mt-4">
                      <h4 className="font-medium">Contact:</h4>
                      <a 
                        href={`mailto:${mentor.email}`}
                        className="text-primary hover:underline"
                      >
                        {mentor.email}
                      </a>
                    </div>
                    )}

                    <div className="mt-4 flex gap-4">
                    {mentor.profileUrl && mentor.profileUrl.startsWith('http') && (
                        <a 
                        href={mentor.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        >
                        View University Profile
                        </a>
                    )}
                    <button
                        onClick={() => handleGenerateEmail(mentor)}
                        className="text-primary hover:underline"
                    >
                        Generate Email Template
                    </button>
                    </div>
                </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg 
                           hover:bg-secondary/80 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="flex items-center text-foreground">
                  Page {currentPage + 1} of {Math.ceil(allMentors.length / professorsPerPage)}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= Math.ceil(allMentors.length / professorsPerPage) - 1}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg 
                           hover:bg-secondary/80 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="p-6 bg-secondary/50 rounded-lg text-center">
              <p className="text-muted-foreground">
                Enter your research interests and location to find potential mentors.
              </p>
            </div>
          )}

          {/* Email Template Modal */}
          {selectedMentor && (
            <EmailTemplateGenerator
              mentor={selectedMentor}
              studentGoals={formData.outreachGoals}
              userResume={userResume}
              onClose={() => setSelectedMentor(null)}
            />
          )}     
        </div>
      </div>
    </div>
  );
};

export default MentorFinder;