import React, { useEffect, useMemo, useRef, useState } from "react";

const PER_PAGE = 12;
const WINDOW_MS = 20_000;
const MAX_REQ_IN_WINDOW = 6;

const HISTORY_KEY = "flickr_search_history_v1";
const MAX_HISTORY = 8;

const THEME_KEY = "flickr_theme_v1"; // "light" | "dark"

function ImageCard({ item }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
      <div className="relative aspect-square bg-gray-100 dark:bg-neutral-700">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}

        <img
          src={item.media?.m}
          alt={item.title || "photo"}
          className={`h-full w-full object-cover transition-opacity ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          loading="lazy"
        />
      </div>

      <div className="p-3">
        <div className="line-clamp-1 font-semibold text-black dark:text-neutral-100">
          {item.title || "Untitled"}
        </div>
        <div className="line-clamp-1 text-sm text-gray-600 dark:text-neutral-300">
          {item.author}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [input, setInput] = useState("nature");
  const [query, setQuery] = useState("nature");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [history, setHistory] = useState([]);

  const [theme, setTheme] = useState("light");
  const isDark = theme === "dark";

  const requestTimesRef = useRef([]);

  const totalPages = useMemo(() => Math.max(Math.ceil(total / PER_PAGE), 1), [total]);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setHistory(parsed);
    } catch {
      setHistory([]);
    }

    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") setTheme(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}

    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    root.style.colorScheme = theme;
  }, [theme]);

  function checkRateLimit() {
    const now = Date.now();
    const kept = requestTimesRef.current.filter((t) => now - t < WINDOW_MS);
    requestTimesRef.current = kept;

    if (kept.length >= MAX_REQ_IN_WINDOW) {
      const waitSec = Math.ceil((WINDOW_MS - (now - kept[0])) / 1000);
      setErr(`Ai făcut prea multe cereri. Așteaptă ~${waitSec} secunde și încearcă din nou.`);
      return false;
    }

    requestTimesRef.current.push(now);
    return true;
  }

  function pushToHistory(term) {
    setHistory((prev) => {
      const next = [term, ...prev.filter((x) => x !== term)].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function clearHistory() {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
    setHistory([]);
  }

  async function loadPhotos(term, currentPage) {
    setLoading(true);
    setErr("");

    try {
      const url = `/.netlify/functions/flickr?tags=${encodeURIComponent(term)}`;
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error("Flickr nu a răspuns corect.");

      const data = await r.json();
      const all = Array.isArray(data.items) ? data.items : [];

      setTotal(all.length);

      const start = (currentPage - 1) * PER_PAGE;
      setItems(all.slice(start, start + PER_PAGE));
    } catch (e) {
      setItems([]);
      setTotal(0);
      setErr(e?.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPhotos(query, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page]);

  function onSubmit(e) {
    e.preventDefault();
    const cleaned = input.trim();
    if (!cleaned) return;

    if (!checkRateLimit()) return;

    pushToHistory(cleaned);
    setPage(1);
    setQuery(cleaned);
  }

  function onHistoryClick(term) {
    if (!checkRateLimit()) return;
    setInput(term);
    setPage(1);
    setQuery(term);
  }

  return (
    // TEST: light = roșu deschis, dark = negru
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">Flickr Photo Search</h1>

            <button
              type="button"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-700"
            >
              {isDark ? "Light mode" : "Dark mode"}
            </button>
          </div>

          <p className="mt-1 text-gray-600 dark:text-neutral-300">
            Caută după tag (ex: nature, cats, sunset)
          </p>

          <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:ring-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              placeholder="Scrie un termen..."
            />
            <button
              className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-50 dark:bg-white dark:text-black"
              disabled={loading}
            >
              Search
            </button>
          </form>

          {history.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {history.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => onHistoryClick(h)}
                  className="rounded-full border border-gray-200 px-3 py-1 text-sm hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-700"
                >
                  {h}
                </button>
              ))}

              <button
                type="button"
                onClick={clearHistory}
                className="ml-auto rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Clear
              </button>
            </div>
          )}

          {err && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
              {err}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-gray-700 dark:text-neutral-200">
              Rezultate pentru <span className="font-semibold">{query}</span> — pagina {page} din {totalPages}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={!canPrev || loading}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="rounded-xl border border-gray-200 px-4 py-2 disabled:opacity-50 hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-700"
              >
                Prev
              </button>

              <button
                type="button"
                disabled={!canNext || loading}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-gray-200 px-4 py-2 disabled:opacity-50 hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <ImageCard key={item.link} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
