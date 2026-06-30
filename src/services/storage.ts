import { supabase } from './supabase';
import type { BookCategory, QuestionEntry, UserProfile } from '../types';

// ─── Row mappers ──────────────────────────────────────────────────────────────

function rowToBook(row: Record<string, unknown>): BookCategory {
  return {
    id:    row.id    as string,
    title: row.title as string,
    topic: row.topic as BookCategory['topic'],
  };
}

function rowToQuestion(row: Record<string, unknown>): QuestionEntry {
  return {
    id:                  row.id                   as string,
    userId:              row.user_id              as string,
    bookId:              row.book_id              as string,
    title:               row.title                as string,
    problemStatement:    row.problem_statement    as string,
    solutionCode:        row.solution_code        as string,
    solutionExplanation: row.solution_explanation as string,
    createdAt:           row.created_at           as string,
  };
}

function rowToProfile(row: Record<string, unknown>): UserProfile {
  return {
    id:          row.id                                    as string,
    username:    row.username                              as string,
    displayName: (row.display_name as string) || (row.username as string),
    bio:         (row.bio          as string) || '',
  };
}

// ─── Storage Service ──────────────────────────────────────────────────────────

export const StorageService = {

  // ── Books ──────────────────────────────────────────────────────────────────

  async getBooks(): Promise<BookCategory[]> {
    const { data, error } = await supabase
      .from('book_categories')
      .select('*')
      .order('title');

    if (error) {
      console.error('[StorageService] getBooks error:', error.message);
      return [];
    }
    return (data ?? []).map(rowToBook);
  },

  async saveBook(book: BookCategory): Promise<void> {
    const { error } = await supabase
      .from('book_categories')
      .upsert({ id: book.id, title: book.title, topic: book.topic }, { onConflict: 'id' });

    if (error) console.error('[StorageService] saveBook error:', error.message);
  },

  // ── Questions (authenticated user) ────────────────────────────────────────

  async getQuestions(): Promise<QuestionEntry[]> {
    const { data, error } = await supabase
      .from('question_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[StorageService] getQuestions error:', error.message);
      return [];
    }
    return (data ?? []).map(rowToQuestion);
  },

  async saveQuestion(question: QuestionEntry): Promise<void> {
    const { error } = await supabase
      .from('question_entries')
      .upsert(
        {
          id:                   question.id,
          user_id:              question.userId,
          book_id:              question.bookId,
          title:                question.title,
          problem_statement:    question.problemStatement,
          solution_code:        question.solutionCode,
          solution_explanation: question.solutionExplanation,
          created_at:           question.createdAt,
        },
        { onConflict: 'id' },
      );

    if (error) console.error('[StorageService] saveQuestion error:', error.message);
  },

  // ── Public Profile (no auth required) ─────────────────────────────────────

  /** Look up a public profile by username. Returns null if not found. */
  async getPublicProfile(username: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) return null;
    return rowToProfile(data as Record<string, unknown>);
  },

  /** Fetch all questions for a given userId (uses public RLS policy). */
  async getPublicQuestions(userId: string): Promise<QuestionEntry[]> {
    const { data, error } = await supabase
      .from('question_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[StorageService] getPublicQuestions error:', error.message);
      return [];
    }
    return (data ?? []).map(rowToQuestion);
  },
};
