import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App.jsx";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockData = {
  items: Array.from({ length: 25 }, (_, i) => ({
    title: `Photo ${i + 1}`,
    link: `https://example.com/${i + 1}`,
    author: `author ${i + 1}`,
    media: { m: `https://example.com/img/${i + 1}.jpg` },
  })),
};

describe("Flickr Photo Search App", () => {
  beforeEach(() => {
    localStorage.clear();

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("afișează titlul aplicației", async () => {
    render(<App />);
    expect(screen.getByText(/Flickr Photo Search/i)).toBeInTheDocument();
  });

  it("conține o bară de căutare cu placeholder-ul corect", () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Scrie un termen/i)).toBeInTheDocument();
  });

  it("afișează butonul Search", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("la pornire face fetch pentru query implicit (nature)", async () => {
    render(<App />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain("/.netlify/functions/flickr");
    expect(url).toContain("tags=nature");
  });

  it("când scrii termen și dai Search, face fetch cu tags=termen", async () => {
  render(<App />);

  // 1) așteptăm primul fetch (nature) care se face automat la mount
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalled();
  });

  // 2) resetăm istoricul apelurilor, ca să verificăm DOAR ce se întâmplă după submit
  global.fetch.mockClear();

  // 3) completăm input + submit
  const input = screen.getByPlaceholderText(/Scrie un termen/i);
  fireEvent.change(input, { target: { value: "cats" } });

  // IMPORTANT: submit pe form e mai sigur decât click, ca să nu fim blocați de disabled/loading
  fireEvent.submit(input.closest("form"));

  // 4) verificăm că a apărut fetch cu tags=cats
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  const url = global.fetch.mock.calls[0][0];
  expect(url).toContain("tags=cats");
});

  it("paginarea: Next trece la pagina 2 și afișează Photo 13", async () => {
    render(<App />);

    // așteaptă să apară primele rezultate
    expect(await screen.findByText("Photo 1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    // pe pagina 2 ar trebui să fie Photo 13
    expect(await screen.findByText("Photo 13")).toBeInTheDocument();
  });

  it("dark mode: click pe buton schimbă tema și salvează în localStorage", async () => {
    render(<App />);

    // butonul e fie Dark mode fie Light mode, îl găsim generic:
    const btn = screen.getByRole("button", { name: /mode/i });
    fireEvent.click(btn);

    // după click, tema trebuie salvată (de obicei 'dark')
    expect(localStorage.getItem("flickr_theme_v1")).toBeTruthy();
  });
});
