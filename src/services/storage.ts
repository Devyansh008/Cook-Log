import { supabase } from './supabase';
import type { BookCategory, QuestionEntry } from '../types';

// ─── Storage Service (Supabase backend) ───────────────────────────────────────
//
// All function NAMES and PARAMETERS are identical to the previous localStorage
// version so that Dashboard.tsx and PublicProfile.tsx require zero signature
// changes — only the addition of `await` at the call-sites.
//
// Column-name mapping (snake_case in Postgres ↔ camelCase in TypeScript):
//
//  book_categories          question_entries
//  ─────────────────        ──────────────────────────
//  id                       id
//  title                    user_id        → userId
//  topic                    book_id        → bookId
//                           title
//                           problem_statement → problemStatement
//                           solution_code     → solutionCode
//                           solution_explanation → solutionExplanation
//                           created_at        → createdAt

// Helper: map a raw Supabase row to our BookCategory type
function rowToBook(row: Record<string, unknown>): BookCategory {
  return {
    id:    row.id    as string,
    title: row.title as string,
    topic: row.topic as BookCategory['topic'],
  };
}

// Helper: map a raw Supabase row to our QuestionEntry type
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
      .upsert(
        { id: book.id, title: book.title, topic: book.topic },
        { onConflict: 'id' },
      );

    if (error) {
      console.error('[StorageService] saveBook error:', error.message);
    }
  },

  // ── Questions ──────────────────────────────────────────────────────────────

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

    if (error) {
      console.error('[StorageService] saveQuestion error:', error.message);
    }
  },
};
