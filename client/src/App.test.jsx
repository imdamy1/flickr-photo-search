// Importăm React (necesar pentru a putea randa componenta App)
import React from "react";

// Importăm funcții din Testing Library:
// render = afișează componenta într-un DOM virtual
// screen = ne ajută să căutăm elemente în pagină
// fireEvent = simulăm acțiuni ale utilizatorului (click, input etc.)
// waitFor = așteaptă operații async (useEffect, fetch)
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Importăm componenta principală a aplicației
import App from "./App.jsx";

// Importăm funcții Vitest pentru scrierea testelor
// describe = grup de teste
// it = un test individual
// expect = verificări (assertions)
// vi = mock-uri (ex: fetch)
// beforeEach / afterEach = rulează cod înainte / după fiecare test
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";


// Date mock care simulează răspunsul de la API-ul Flickr
// Cream 25 de poze false, suficiente pentru a testa paginarea
const mockData = {
  items: Array.from({ length: 25 }, (_, i) => ({
    title: `Photo ${i + 1}`,                      // titlul pozei
    link: `https://example.com/${i + 1}`,         // link unic (key)
    author: `author ${i + 1}`,                    // autorul
    media: { m: `https://example.com/img/${i + 1}.jpg` }, // URL imagine
  })),
};


// Grupul principal de teste pentru aplicație
describe("Flickr Photo Search App", () => {

  // Se execută înaintea fiecărui test
  beforeEach(() => {
    // Curățăm localStorage ca testele să fie independente
    localStorage.clear();

    // Facem mock la fetch ca să NU apelăm API-ul real Flickr
    // Orice fetch va returna mockData
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,                 // simulăm un răspuns HTTP valid
      json: async () => mockData,
    });
  });

  // Se execută după fiecare test
  afterEach(() => {
    // Eliminăm mock-urile pentru a nu afecta alte teste
    vi.restoreAllMocks();
  });


  // Test: aplicația afișează titlul corect
  it("afișează titlul aplicației", async () => {
    render(<App />); // randăm aplicația

    // Așteptăm ca titlul să apară în pagină
    expect(
      await screen.findByText(/Flickr Photo Search/i)
    ).toBeInTheDocument();
  });


  // Test: există input-ul de căutare cu placeholder corect
  it("conține o bară de căutare cu placeholder-ul corect", async () => {
    render(<App />);

    // Verificăm dacă input-ul există
    expect(
      await screen.findByPlaceholderText(/Scrie un termen/i)
    ).toBeInTheDocument();
  });


  // Test: butonul Search este afișat
  it("afișează butonul Search", async () => {
    render(<App />);

    // Căutăm butonul după rol și text
    expect(
      await screen.findByRole("button", { name: /search/i })
    ).toBeInTheDocument();
  });


  // Test: la pornire aplicația face fetch cu query-ul implicit "nature"
  it("la pornire face fetch pentru query implicit (nature)", async () => {
    render(<App />);

    // Așteptăm ca fetch să fie apelat o dată
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    // Luăm URL-ul cu care a fost apelat fetch
    const url = global.fetch.mock.calls[0][0];

    // Verificăm că se apelează API-ul Flickr prin proxy
    expect(url).toContain("corsproxy.io");
    expect(url).toContain("www.flickr.com%2Fservices%2Ffeeds%2Fphotos_public.gne");

    // tags=nature este encodat (tags%3Dnature)
    expect(url).toContain("tags%3Dnature");
  });


  // Test: când utilizatorul caută "cats", fetch-ul conține tags=cats
  it("când scrii termen și dai Search, face fetch cu tags=termen", async () => {
    render(<App />);

    // Așteptăm fetch-ul inițial (pentru nature)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    // Resetăm istoricul de apeluri fetch
    global.fetch.mockClear();

    // Simulăm scrierea în input
    const input = screen.getByPlaceholderText(/Scrie un termen/i);
    fireEvent.change(input, { target: { value: "cats" } });

    // Simulăm submit-ul formularului
    fireEvent.submit(input.closest("form"));

    // După submit trebuie să existe un nou fetch
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain("tags%3Dcats");
  });


  // Test: paginarea funcționează
  it("paginarea: Next trece la pagina 2 și afișează Photo 13", async () => {
    render(<App />);

    // Pe pagina 1 apare Photo 1
    expect(await screen.findByText("Photo 1")).toBeInTheDocument();

    // Simulăm click pe butonul Next
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    // Pagina 2 începe cu Photo 13 (PER_PAGE = 12)
    expect(await screen.findByText("Photo 13")).toBeInTheDocument();
  });


  // Test: dark mode se schimbă și este salvat în localStorage
  it("dark mode: click pe buton schimbă tema și salvează în localStorage", async () => {
    render(<App />);

    // Găsim butonul de schimbare temă
    const btn = await screen.findByRole("button", { name: /mode/i });

    // Simulăm click
    fireEvent.click(btn);

    // Verificăm că tema a fost salvată în localStorage
    await waitFor(() => {
      const savedTheme = localStorage.getItem("flickr_theme_v1");
      expect(["dark", "light"]).toContain(savedTheme);
    });
  });
});
