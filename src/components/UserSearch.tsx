import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import type { UserProfile } from '../types';

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debouncing logic: 300ms
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const matched = await StorageService.searchProfiles(query);
        setResults(matched);
      } catch (err) {
        console.error('[UserSearch] Error searching profiles:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // Click outside detection to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (user: UserProfile) => {
    // Update input to the selected username or display name
    setQuery(user.displayName || user.username);
    setOpen(false);
    // Navigate to their profile
    navigate(`/user/${user.username}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search developers..."
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          className="w-full pl-9 pr-9 py-1.5 bg-white/5 border border-white/[0.08] rounded-lg text-xs text-gray-200 placeholder-gray-500
                     focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50
                     transition-all duration-200"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400">
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </span>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {open && query.trim() !== '' && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#111318] border border-white/[0.08] rounded-lg shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          {loading && results.length === 0 ? (
            <div className="px-4 py-3 text-center text-xs text-gray-500">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-center text-xs text-gray-500">
              No developers found
            </div>
          ) : (
            <ul className="py-1 max-h-56 overflow-y-auto">
              {results.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(user)}
                    className="w-full text-left px-4 py-2.5 hover:bg-violet-600/10 text-xs transition-colors duration-150 flex flex-col gap-0.5 group"
                  >
                    <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">
                      {user.displayName}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      @{user.username}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
