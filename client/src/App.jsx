// Importăm React și hook-urile folosite în aplicație:
// useState = păstrează valori care se schimbă (stări)
// useEffect = rulează cod automat la încărcare / la schimbări
// useMemo = calculează o valoare și o memorează (optimizare)
// useRef = păstrează o valoare între re-renders fără să provoace re-render
import React, { useEffect, useMemo, useRef, useState } from "react";

// Câte poze afișăm pe o pagină (pentru pagination)
const PER_PAGE = 12;

// Fereastra de timp pentru limitarea cererilor (20 secunde)
const WINDOW_MS = 20_000;

// Numărul maxim de request-uri permise în WINDOW_MS
const MAX_REQ_IN_WINDOW = 6;

// Cheie pentru salvarea istoricului de căutări în localStorage
const HISTORY_KEY = "flickr_search_history_v1";

// Câte căutări păstrăm maxim în istoric
const MAX_HISTORY = 8;

// Cheie pentru tema (light/dark) salvată în localStorage
const THEME_KEY = "flickr_theme_v1"; // "light" | "dark"


// Componentă care afișează o singură poză (un card)
function ImageCard({ item }) {
  // loaded = dacă imaginea s-a încărcat (pentru a arăta spinner până atunci)
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
      <div className="relative aspect-square bg-gray-100 dark:bg-neutral-700">
        
        {/* Dacă imaginea NU e încă încărcată, arătăm un spinner */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}

        {/* Imaginea propriu-zisă */}
        <img
          src={item.media?.m} // URL-ul imaginii din răspunsul Flickr
          alt={item.title || "photo"} // text alternativ (pentru accesibilitate)
          className={`h-full w-full object-cover transition-opacity ${
            loaded ? "opacity-100" : "opacity-0" // efect: apare treptat când se încarcă
          }`}
          onLoad={() => setLoaded(true)} // când s-a încărcat, ascundem spinner-ul
          loading="lazy" // optimizare: încarcă poza doar când ajunge în viewport
        />
      </div>

      {/* Zona de text de sub imagine */}
      <div className="p-3">
        <div className="line-clamp-1 font-semibold text-black dark:text-neutral-100">
          {item.title || "Untitled"} {/* titlul pozei */}
        </div>
        <div className="line-clamp-1 text-sm text-gray-600 dark:text-neutral-300">
          {item.author} {/* autorul */}
        </div>
      </div>
    </div>
  );
}


// Componenta principală a aplicației
export default function App() {
  // input = ce scrie utilizatorul în textbox
  const [input, setInput] = useState("nature");

  // query = termenul cu care căutăm efectiv (când apăsăm Search)
  const [query, setQuery] = useState("nature");

  // page = pagina curentă (1,2,3...)
  const [page, setPage] = useState(1);

  // items = pozele afișate pe pagina curentă
  const [items, setItems] = useState([]);

  // total = câte rezultate totale am primit (pentru a calcula paginile)
  const [total, setTotal] = useState(0);

  // loading = arată dacă se încarcă datele
  const [loading, setLoading] = useState(false);

  // err = mesaj de eroare (rate limit / probleme la fetch)
  const [err, setErr] = useState("");

  // history = lista de termeni căutați (salvată în localStorage)
  const [history, setHistory] = useState([]);

  // theme = tema aplicației (light sau dark)
  const [theme, setTheme] = useState("light");

  // variabilă helper pentru UI
  const isDark = theme === "dark";

  // requestTimesRef = ține minte momentele când am făcut request-uri,
  // ca să implementăm "rate limit" (prevenim spam la cereri)
  const requestTimesRef = useRef([]);

  // totalPages = câte pagini avem în total, în funcție de total și PER_PAGE
  // useMemo îl recalculează doar când se schimbă total (optimizare)
  const totalPages = useMemo(
    () => Math.max(Math.ceil(total / PER_PAGE), 1),
    [total]
  );

  // Butoanele Prev/Next sunt active doar dacă există pagină înainte/după
  const canPrev = page > 1;
  const canNext = page < totalPages;


  // La încărcarea aplicației (o singură dată):
  // citim istoricul și tema din localStorage
  useEffect(() => {
    // Citire istoric
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setHistory(parsed);
    } catch {
      setHistory([]);
    }

    // Citire temă
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") setTheme(saved);
    } catch {}
  }, []);


  // De fiecare dată când se schimbă tema:
  // 1) o salvăm în localStorage
  // 2) adăugăm/ștergem clasa "dark" pe <html>
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}

    const root = document.documentElement; // <html>
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    // Ajută browserul să știe schema de culori
    root.style.colorScheme = theme;
  }, [theme]);


  // Funcție: verifică dacă utilizatorul a făcut prea multe cereri într-un interval scurt
  function checkRateLimit() {
    const now = Date.now();

    // Păstrăm doar cererile făcute în ultimele WINDOW_MS milisecunde
    const kept = requestTimesRef.current.filter((t) => now - t < WINDOW_MS);
    requestTimesRef.current = kept;

    // Dacă am depășit limita, afișăm mesaj și blocăm cererea
    if (kept.length >= MAX_REQ_IN_WINDOW) {
      const waitSec = Math.ceil((WINDOW_MS - (now - kept[0])) / 1000);
      setErr(
        `Ai făcut prea multe cereri. Așteaptă ~${waitSec} secunde și încearcă din nou.`
      );
      return false;
    }

    // Altfel, înregistrăm cererea curentă și permitem request-ul
    requestTimesRef.current.push(now);
    return true;
  }


  // Salvează termenul în istoricul căutărilor + în localStorage
  function pushToHistory(term) {
    setHistory((prev) => {
      // Punem termenul în față și eliminăm duplicatele
      const next = [term, ...prev.filter((x) => x !== term)].slice(0, MAX_HISTORY);

      // Persistăm în localStorage
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {}

      return next;
    });
  }


  // Șterge istoricul din localStorage și din state
  function clearHistory() {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
    setHistory([]);
  }


  // Funcția principală care aduce pozele de la Flickr
  // term = tag-ul căutat, currentPage = pagina de afișat
  async function loadPhotos(term, currentPage) {
    setLoading(true); // arătăm loader
    setErr(""); // resetăm erorile

    try {
      // URL Flickr (feed public, fără cheie API)
      const flickrUrl =
        `https://www.flickr.com/services/feeds/photos_public.gne?format=json&nojsoncallback=1&tags=${encodeURIComponent(term)}`;

      // Proxy CORS (util în deployment; browserul blochează uneori request-ul direct)
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(flickrUrl)}`;

      // Cererea efectivă
      const r = await fetch(proxyUrl);

      // Dacă nu e OK (ex: 500, 403), aruncăm eroare
      if (!r.ok) throw new Error("Flickr nu a răspuns corect.");

      // Convertim răspunsul în JSON
      const data = await r.json();

      // Luăm lista de poze din data.items
      const all = Array.isArray(data.items) ? data.items : [];

      // total = numărul total de rezultate
      setTotal(all.length);

      // Calculăm ce elemente apar pe pagina curentă
      const start = (currentPage - 1) * PER_PAGE;
      setItems(all.slice(start, start + PER_PAGE));
    } catch (e) {
      // Dacă apare eroare, golim datele și afișăm mesaj
      setItems([]);
      setTotal(0);
      setErr("Eroare la încărcarea pozelor. Încearcă din nou.");
    } finally {
      // Oprim loader-ul indiferent dacă a mers sau nu
      setLoading(false);
    }
  }


  // Când se schimbă query sau page, încărcăm din nou pozele
  useEffect(() => {
    loadPhotos(query, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page]);


  // Când utilizatorul apasă Search (submit pe form)
  function onSubmit(e) {
    e.preventDefault(); // prevenim refresh-ul paginii

    const cleaned = input.trim(); // eliminăm spațiile
    if (!cleaned) return; // nu acceptăm input gol

    // verificăm limitarea request-urilor
    if (!checkRateLimit()) return;

    // salvăm în istoric, resetăm pagina la 1 și setăm query-ul
    pushToHistory(cleaned);
    setPage(1);
    setQuery(cleaned);
  }


  // Când utilizatorul dă click pe un termen din istoric
  function onHistoryClick(term) {
    if (!checkRateLimit()) return;

    setInput(term); // punem termenul în input (vizual)
    setPage(1);     // resetăm pagina
    setQuery(term); // declanșăm încărcarea pozelor pentru acel termen
  }


  // Interfața aplicației (JSX)
  return (
    // Comentariu vechi de test (nu afectează aplicația)
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">Flickr Photo Search</h1>

            {/* Buton de schimbare temă */}
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

          {/* Formular de căutare */}
          <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={input} // valoarea din state
              onChange={(e) => setInput(e.target.value)} // actualizăm state-ul când scriem
              className="w-full flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:ring-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              placeholder="Scrie un termen..."
            />
            <button
              className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-50 dark:bg-white dark:text-black"
              disabled={loading} // cât timp se încarcă, blocăm butonul
            >
              Search
            </button>
          </form>

          {/* Istoricul căutărilor (tag-uri clickabile) */}
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

              {/* Buton clear history */}
              <button
                type="button"
                onClick={clearHistory}
                className="ml-auto rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Clear
              </button>
            </div>
          )}

          {/* Afișare mesaj de eroare */}
          {err && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
              {err}
            </div>
          )}

          {/* Header de rezultate + pagination */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-gray-700 dark:text-neutral-200">
              Rezultate pentru <span className="font-semibold">{query}</span> — pagina {page} din {totalPages}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={!canPrev || loading} // dezactivăm dacă nu există pagină anterioară
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="rounded-xl border border-gray-200 px-4 py-2 disabled:opacity-50 hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-700"
              >
                Prev
              </button>

              <button
                type="button"
                disabled={!canNext || loading} // dezactivăm dacă nu există pagină următoare
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-gray-200 px-4 py-2 disabled:opacity-50 hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Dacă se încarcă, arătăm loader general; altfel, afișăm grid-ul */}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              // Cheia e link-ul (unic), iar item este poza
              <ImageCard key={item.link} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
