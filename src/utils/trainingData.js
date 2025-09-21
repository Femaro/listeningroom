// Training modules data structure
export const TRAINING_MODULES = [
  {
    id: "module-1",
    title: "Welcome & Platform Overview",
    description: "Introduction to our mission, values, and platform features.",
    duration: 15, // minutes
    level: 1,
    required: true,
    icon: "BookOpen",
    color: "teal",
    content: {
      sections: [
        {
          title: "Our Mission",
          content: "Learn about our commitment to providing accessible mental health support globally.",
          type: "text"
        },
        {
          title: "Platform Features",
          content: "Overview of all available tools and features for volunteers.",
          type: "text"
        },
        {
          title: "Code of Conduct",
          content: "Understanding our values and ethical guidelines.",
          type: "text"
        }
      ],
      quiz: {
        questions: [
          {
            id: "q1",
            question: "What is our primary mission?",
            options: [
              "To provide free mental health support",
              "To make money from volunteers",
              "To replace professional therapy"
            ],
            correct: 0
          },
          {
            id: "q2",
            question: "How should you handle confidential information?",
            options: [
              "Share it with other volunteers",
              "Keep it completely confidential",
              "Post it online for awareness"
            ],
            correct: 1
          }
        ],
        passingScore: 80
      }
    }
  },
  {
    id: "module-2",
    title: "Active Listening Fundamentals",
    description: "Core principles of effective listening and empathetic communication.",
    duration: 30,
    level: 1,
    required: true,
    icon: "Headphones",
    color: "blue",
    content: {
      sections: [
        {
          title: "What is Active Listening?",
          content: "Understanding the difference between hearing and listening.",
          type: "text"
        },
        {
          title: "Empathetic Communication",
          content: "Techniques for showing empathy and understanding.",
          type: "text"
        },
        {
          title: "Non-verbal Cues",
          content: "Recognizing and responding to non-verbal communication.",
          type: "text"
        }
      ],
      quiz: {
        questions: [
          {
            id: "q1",
            question: "What is the most important aspect of active listening?",
            options: [
              "Giving advice immediately",
              "Fully focusing on the speaker",
              "Interrupting to show understanding"
            ],
            correct: 1
          }
        ],
        passingScore: 80
      }
    }
  },
  {
    id: "module-3",
    title: "Crisis Recognition & Response",
    description: "How to identify crisis situations and respond appropriately.",
    duration: 45,
    level: 2,
    required: true,
    icon: "Shield",
    color: "red",
    content: {
      sections: [
        {
          title: "Recognizing Crisis Signs",
          content: "Identifying warning signs of mental health crises.",
          type: "text"
        },
        {
          title: "Immediate Response",
          content: "What to do when someone is in crisis.",
          type: "text"
        },
        {
          title: "Emergency Resources",
          content: "When and how to connect people with emergency services.",
          type: "text"
        }
      ],
      quiz: {
        questions: [
          {
            id: "q1",
            question: "What should you do if someone mentions suicide?",
            options: [
              "Ignore it to avoid making it worse",
              "Take it seriously and connect them with crisis resources",
              "Tell them to think positive thoughts"
            ],
            correct: 1
          }
        ],
        passingScore: 90
      }
    }
  },
  {
    id: "module-4",
    title: "Building Rapport & Trust",
    description: "Techniques for creating safe, trusting relationships with users.",
    duration: 25,
    level: 2,
    required: true,
    icon: "Users",
    color: "green",
    content: {
      sections: [
        {
          title: "Creating Safe Spaces",
          content: "How to make users feel comfortable and safe.",
          type: "text"
        },
        {
          title: "Building Trust",
          content: "Techniques for establishing trust and rapport.",
          type: "text"
        }
      ],
      quiz: {
        questions: [
          {
            id: "q1",
            question: "What is the best way to build trust?",
            options: [
              "Share your personal problems",
              "Be consistent and reliable",
              "Give advice immediately"
            ],
            correct: 1
          }
        ],
        passingScore: 80
      }
    }
  },
  {
    id: "module-5",
    title: "Boundaries & Self-Care",
    description: "Maintaining healthy boundaries and practicing effective self-care.",
    duration: 20,
    level: 2,
    required: true,
    icon: "Heart",
    color: "purple",
    content: {
      sections: [
        {
          title: "Setting Boundaries",
          content: "How to maintain healthy professional boundaries.",
          type: "text"
        },
        {
          title: "Self-Care Practices",
          content: "Importance of self-care for volunteers.",
          type: "text"
        }
      ],
      quiz: {
        questions: [
          {
            id: "q1",
            question: "Why is self-care important for volunteers?",
            options: [
              "It's not important",
              "To prevent burnout and maintain effectiveness",
              "Only for personal benefit"
            ],
            correct: 1
          }
        ],
        passingScore: 80
      }
    }
  },
  {
    id: "module-6",
    title: "Platform Tools & Features",
    description: "Complete guide to using all platform features effectively.",
    duration: 15,
    level: 1,
    required: true,
    icon: "Award",
    color: "orange",
    content: {
      sections: [
        {
          title: "Dashboard Navigation",
          content: "How to use the volunteer dashboard effectively.",
          type: "text"
        },
        {
          title: "Session Management",
          content: "Managing and tracking your volunteer sessions.",
          type: "text"
        }
      ],
      quiz: {
        questions: [
          {
            id: "q1",
            question: "Where can you check your session history?",
            options: [
              "In the settings",
              "On the dashboard",
              "Nowhere"
            ],
            correct: 1
          }
        ],
        passingScore: 80
      }
    }
  }
];

// Volunteer levels based on training completion
export const VOLUNTEER_LEVELS = [
  {
    level: 0,
    name: "Trainee",
    description: "New volunteer, no training completed",
    requirements: [],
    benefits: ["Access to basic platform features"],
    color: "gray"
  },
  {
    level: 1,
    name: "Basic Volunteer",
    description: "Completed foundational training",
    requirements: ["module-1", "module-2", "module-6"],
    benefits: ["Can start basic support sessions", "Access to volunteer community"],
    color: "blue"
  },
  {
    level: 2,
    name: "Advanced Volunteer",
    description: "Completed all required training",
    requirements: ["module-1", "module-2", "module-3", "module-4", "module-5", "module-6"],
    benefits: ["Can handle crisis situations", "Access to advanced features", "Mentor new volunteers"],
    color: "green"
  },
  {
    level: 3,
    name: "Expert Volunteer",
    description: "Completed additional specialized training",
    requirements: ["module-1", "module-2", "module-3", "module-4", "module-5", "module-6", "specialized-training"],
    benefits: ["Lead training sessions", "Access to all platform features", "Priority support"],
    color: "purple"
  }
];

// Calculate volunteer level based on completed modules
export function calculateVolunteerLevel(completedModules) {
  const completedModuleIds = completedModules.map(m => m.moduleId);
  
  for (let i = VOLUNTEER_LEVELS.length - 1; i >= 0; i--) {
    const level = VOLUNTEER_LEVELS[i];
    if (level.requirements.every(req => completedModuleIds.includes(req))) {
      return level;
    }
  }
  
  return VOLUNTEER_LEVELS[0]; // Default to trainee level
}

// Get next required modules for a volunteer
export function getNextRequiredModules(completedModules) {
  const completedModuleIds = completedModules.map(m => m.moduleId);
  const currentLevel = calculateVolunteerLevel(completedModules);
  
  // Find the next level that hasn't been achieved
  const nextLevelIndex = VOLUNTEER_LEVELS.findIndex(level => 
    level.level > currentLevel.level && 
    level.requirements.every(req => completedModuleIds.includes(req))
  );
  
  if (nextLevelIndex === -1) {
    // Already at highest level
    return [];
  }
  
  const nextLevel = VOLUNTEER_LEVELS[nextLevelIndex];
  return nextLevel.requirements.filter(req => !completedModuleIds.includes(req));
}
