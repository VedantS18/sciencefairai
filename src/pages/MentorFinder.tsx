import React, { useState } from "react";
import DarkModeToggle from '../components/ui/DarkModeToggle';
import { searchMentors, type MentorSearchResult } from '../services/mentorFinder';
import EmailTemplateGenerator from '../components/EmailTemplateGenerator';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  const [userResume, setUserResume] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [allMentors, setAllMentors] = useState<MentorSearchResult[]>([]);
  const [searchResults, setSearchResults] = useState<MentorSearchResult[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<MentorSearchResult | null>(null);
  const [expandedMentorId, setExpandedMentorId] = useState<string | null>(null);
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

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
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
    setShowResults(false);
    
    try {
      const results = await searchMentors({
        researchInterests: formData.researchInterests,
        location: formData.location,
        searchRadius: formData.searchRadius
      });
      setAllMentors(results);
      setSearchResults(results.slice(0, professorsPerPage));
      setShowResults(true);
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

  const toggleMentorExpansion = (mentorId: string) => {
    setExpandedMentorId(expandedMentorId === mentorId ? null : mentorId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-primary">Research Mentor Finder</h1>
          <p className="text-lg text-secondary-foreground">
            Find and connect with academic mentors in your area of interest
          </p>
        </div>

        {/* Search Form - Full width when results aren't showing */}
        <div className={`transition-all duration-300 ease-in-out ${showResults ? 'mb-8' : 'mb-0'}`}>
          <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-lg p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <button
              type="submit"
              disabled={isSearching}
              className="w-full md:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg 
                       hover:bg-primary/80 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? "Searching..." : "Find Mentors"}
            </button>
          </form>
        </div>

        {/* Results Section */}
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
        ) : showResults ? (
          <div className="space-y-4">
            {searchResults.map((mentor) => (
              <div 
                key={mentor.name} 
                className="bg-card rounded-lg shadow-md overflow-hidden transition-all duration-300"
              >
                {/* Preview Section - Always Visible */}
                <div className="p-6 cursor-pointer hover:bg-accent/50" onClick={() => toggleMentorExpansion(mentor.name)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-primary">{mentor.name}</h3>
                      <p className="text-secondary-foreground">{mentor.title} at {mentor.institution}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {mentor.expertise?.slice(0, 3).map((area) => (
                          <span key={area} className="px-2 py-1 bg-primary/10 rounded-full text-sm">
                            {area}
                          </span>
                        ))}
                        {mentor.expertise && mentor.expertise.length > 3 && (
                          <span className="px-2 py-1 bg-primary/10 rounded-full text-sm">
                            +{mentor.expertise.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    {expandedMentorId === mentor.name ? (
                      <ChevronUp className="w-6 h-6 text-primary" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-primary" />
                    )}
                  </div>
                </div>

                {/* Expanded Section */}
                {expandedMentorId === mentor.name && (
                  <div className="p-6 border-t border-border bg-accent/50">
                    {mentor.researchSummary && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Current Research:</h4>
                        <p className="text-secondary-foreground">
                          {mentor.researchSummary}
                        </p>
                      </div>
                    )}

                    {mentor.labName && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Research Group:</h4>
                        <p className="font-medium">{mentor.labName}</p>
                        {mentor.labDescription && (
                          <p className="text-secondary-foreground mt-1">
                            {mentor.labDescription}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 mt-6">
                      {mentor.email && (
                        <a 
                          href={`mailto:${mentor.email}`}
                          className="inline-flex items-center text-primary hover:underline"
                        >
                          Email Directly
                        </a>
                      )}
                      {mentor.profileUrl && mentor.profileUrl.startsWith('http') && (
                        <a 
                          href={mentor.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary hover:underline"
                        >
                          View University Profile
                        </a>
                      )}
                      <button
                        onClick={() => handleGenerateEmail(mentor)}
                        className="inline-flex items-center text-primary hover:underline"
                      >
                        Generate Email
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

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
          </div>
        ) : null}

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
  );
};

export default MentorFinder;