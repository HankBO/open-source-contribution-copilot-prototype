export interface Repo {
  id?: number;
  name: string;
  description: string;
  stars: string;
  url: string;
  topic_id?: number;
}

export interface Issue {
  id?: number;
  repo_id?: number;
  title: string;
  url: string;
  number: string;
  labels: string[];
  analysis?: IssueAnalysis | null;
}

export interface IssueAnalysis {
  difficulty: number; // 1-5
  estimated_hours: string;
  required_skills: string[];
  summary: string;
  implementation_plan: string[];
}

export interface SearchTopic {
  id?: number;
  term: string;
  created_at: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export enum AgentStatus {
  IDLE = 'IDLE',
  SEARCHING_REPOS = 'SEARCHING_REPOS',
  FINDING_ISSUES = 'FINDING_ISSUES',
  ANALYZING_ISSUE = 'ANALYZING_ISSUE',
}
