import { MentorSearchResult } from './mentorFinder';

export const mockMentors: MentorSearchResult[] = [
  {
    name: "Dr. Sarah Johnson",
    title: "Associate Professor",
    institution: "Stanford University",
    department: "Computer Science",
    expertise: ["Machine Learning", "Artificial Intelligence", "Computer Vision"],
    email: "sarah.johnson@stanford.edu",
    researchSummary: "Focusing on advanced machine learning algorithms and their applications in computer vision.",
    labName: "AI & Vision Lab",
    labDescription: "Research group exploring cutting-edge AI applications.",
    profileUrl: "https://stanford.edu/faculty/sjohnson",
    relevanceScore: 0,
    location: ""
  },
  {
    name: "Dr. Michael Chen",
    title: "Assistant Professor",
    institution: "MIT",
    department: "Physics",
    expertise: ["Quantum Computing", "Theoretical Physics", "Mathematics"],
    email: "mchen@mit.edu",
    researchSummary: "Working on quantum algorithms and their implications for computational complexity.",
    labName: "Quantum Computing Group",
    labDescription: "Advancing the frontiers of quantum computation.",
    profileUrl: "https://mit.edu/faculty/mchen",
    relevanceScore: 0,
    location: ""
  },
  // Add more mock mentors...
];

export const searchMockMentors = async (params: {
  researchInterests: string;
  location: string;
  searchRadius: string;
}): Promise<MentorSearchResult[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple search simulation
  return mockMentors.filter(mentor => 
    mentor.expertise.some(exp => 
      exp.toLowerCase().includes(params.researchInterests.toLowerCase())
    )
  );
}; 