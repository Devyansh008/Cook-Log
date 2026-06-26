import type { BookCategory, QuestionEntry } from '../types';

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  books: 'cooklog_books',
  questions: 'cooklog_questions',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function persist<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Storage Service ──────────────────────────────────────────────────────────

export const StorageService = {
  // Books
  getBooks(): BookCategory[] {
    return load<BookCategory>(KEYS.books);
  },

  saveBook(book: BookCategory): void {
    const books = this.getBooks();
    const index = books.findIndex((b) => b.id === book.id);
    if (index !== -1) {
      books[index] = book; // update existing
    } else {
      books.push(book);   // insert new
    }
    persist(KEYS.books, books);
  },

  // Questions
  getQuestions(): QuestionEntry[] {
    return load<QuestionEntry>(KEYS.questions);
  },

  saveQuestion(question: QuestionEntry): void {
    const questions = this.getQuestions();
    const index = questions.findIndex((q) => q.id === question.id);
    if (index !== -1) {
      questions[index] = question; // update existing
    } else {
      questions.push(question);    // insert new
    }
    persist(KEYS.questions, questions);
  },
};
