// ─── User ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
}

// ─── Book Category ────────────────────────────────────────────────────────────

export type Topic = 'coding' | 'math' | 'algorithms';

export interface BookCategory {
  id: string;
  title: string;
  topic: Topic;
}

// ─── Question Entry ───────────────────────────────────────────────────────────

export interface QuestionEntry {
  id: string;
  userId: string;
  bookId: string;
  title: string;
  problemStatement: string;
  solutionCode: string;
  solutionExplanation: string;
  createdAt: string; // ISO 8601 date string
}
