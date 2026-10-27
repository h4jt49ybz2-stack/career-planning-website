export type PathId = "work" | "domestic" | "overseas";
export type PageId =
  | "overview"
  | "profile"
  | "directions"
  | "resume"
  | "actions"
  | "resources";

export interface Profile {
  name: string;
  email: string;
  phone: string;
  city: string;
  school: string;
  major: string;
  degree: "本科" | "硕士" | "博士" | "专科" | "";
  educationStart: string;
  graduation: string;
  gpa: string;
  english: string;
  goal: PathId | "explore";
  targetRole: string;
  interests: string[];
  skills: string[];
  preferredCities: string[];
  expectedSalary: string;
  personalPriority: "growth" | "stability" | "balance";
  budget: number;
  familyPreference: PathId | "open";
  familyNotes: string;
  autonomy: number;
  internshipCompany: string;
  internshipRole: string;
  internshipMonths: number;
  internshipAchievement: string;
  projectName: string;
  projectDescription: string;
  portfolioUrl: string;
  availability: string;
  jobType: "全职" | "实习" | "均可";
}

export interface PathRecommendation {
  id: PathId;
  title: string;
  subtitle: string;
  score: number;
  description: string;
  reasons: string[];
  gaps: string[];
  nextSteps: string[];
  tags: string[];
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: "求职准备" | "升学准备" | "方向探索" | "沟通计划";
  priority: "优先" | "重要" | "建议";
  duration: string;
  week: number;
}

export interface ResumeCheck {
  id: string;
  label: string;
  complete: boolean;
  required: boolean;
  tip: string;
}

export interface PlanAnalysis {
  paths: PathRecommendation[];
  actions: ActionItem[];
  resumeChecks: ResumeCheck[];
  completeness: number;
  familyAlignment: string;
  focusRole: string;
  summary: string;
}
