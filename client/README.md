# Project 1 — Flickr Photo Search (React + Vite)

## Team
- Student 1: Bejenaru Georgiana
- Student 2: Vega Damian

Aplicație live:
https://flickr-photo-search-mu.vercel.app/
 Repository GitHub:
https://github.com/imdamy1/flickr-photo-search

## 1.Introducere
Acest proiect constă în dezvoltarea unei aplicații web moderne, realizate predominant pe partea de client, folosind tehnologii actuale din ecosistemul JavaScript. Aplicația permite utilizatorilor să caute fotografii publice folosind serviciul Flickr Public Photo Feed, pe baza unui termen introdus (tag), și să vizualizeze rezultatele într-o interfață grafică prietenoasă și responsive.

Aplicația a fost dezvoltată folosind React pentru partea de interfață, Tailwind CSS pentru stilizare și Vite ca instrument de build. Proiectul respectă principiile programării reactive și funcționale, fiind bazat pe hooks React (useState, useEffect, useMemo, useRef).

Scopul proiectului este de a demonstra:
- utilizarea unui framework JavaScript modern;
- consumul unui API public;
- organizarea modulară a codului;
- optimizarea experienței utilizatorului;
- testarea unitară;
- deployment într-un mediu de producție real.

## 2.Tehnologii utilizate
- React – dezvoltarea interfeței grafice (client-side rendering)
- Vite – tool de dezvoltare și build
- Tailwind CSS – stilizare modernă și layout responsive
- JavaScript (ES6+)
- Flickr Public Photo Feed API
- Netlify Functions – proxy API (evitarea problemelor CORS)
- Vitest + Testing Library – testare unitară
- LocalStorage – persistarea preferințelor utilizatorului
- Vercel – deployment aplicație
- GitHub – versionare și livrare continuă

## 3.Descriere generală a aplicației
Aplicația oferă următoarele funcționalități principale:
- căutare fotografii după tag
- afișarea rezultatelor într-un grid responsive
- paginare locală
- indicator de încărcare (loading spinner)
- tratarea limitelor de cereri (rate limiting)
- istoric al căutărilor salvat local
- mod Light / Dark, cu salvarea preferinței utilizatorului

## 4.Integrarea Flickr Public Photo Feed
Aplicația utilizează endpoint-ul public oferit de Flickr:
https://www.flickr.com/services/feeds/photos_public.gne

Cererea este realizată folosind parametrii:
- format=json
- nojsoncallback=1
- tags=<search_term>
Pentru dezvoltare și deployment, cererile sunt realizate printr-o Netlify Function, care acționează ca proxy între aplicație și API-ul Flickr, asigurând compatibilitate și securitate.
Datele returnate sunt procesate și afișate dinamic folosind React.

## 5.Funcționalități implementate (Constraints)
5.1 Afișarea imaginilor (graphics program)
 Aplicația afișează imaginile returnate de API-ul Flickr într-un grid responsive, folosind componente React reutilizabile.

5.2 Paginare
A fost implementată paginare locală:
- un număr fix de imagini per pagină;
- navigare între pagini folosind butoane Prev / Next.

5.3 Interfață responsive (Tailwind CSS)
Tailwind CSS este utilizat pentru:
- layout adaptabil (desktop / mobil);
- stilizare modernă;
- consistență vizuală.

5.4 Loading spinner (UX)
Pentru o experiență îmbunătățită:
- spinner global la încărcarea datelor;
- placeholder animat pentru imaginile individuale.

5.5 Rate limiting
A fost implementată limitarea cererilor:
- maxim 6 cereri în 20 de secunde;
- mesaj prietenos afișat utilizatorului când limita este depășită.

## 6.Funcționalități suplimentare implementate (Challenges)
6.1 Istoric căutări (LocalStorage)
Aplicația salvează automat termenii căutați folosind LocalStorage:
- istoricul este păstrat între sesiuni;
- termenii sunt afișați ca tag-uri clickabile;
- utilizatorul poate relua rapid o căutare anterioară.

Această funcționalitate îndeplinește cerința:
implement a feature to save the user’s search history in local storage

6.2 Dark Mode / Light Mode
A fost implementat un toggle pentru Dark Mode / Light Mode:
- utilizatorul poate schimba tema aplicației;
- preferința este salvată în LocalStorage;
- tema este restaurată automat la reîncărcarea aplicației.

Această funcționalitate îndeplinește cerința:
add a toggle for dark mode and save the user’s preference in local storage

## 7.Structura aplicației
flickr-photo-search/
│
├── .netlify/
├── .vs/
├── client/
│   ├── .netlify/
│   ├── dist/
│   ├── netlify/
│   │   └── functions/
│   │       └── flickr.js
│   ├── node_modules/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── App.test.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── testSetup.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── vitest.config.js
│   └── README.md   
│
├── netlify.toml
└── .gitignore

## 8.Testare unitară

Aplicația conține testare unitară realizată cu:

- Vitest
- @testing-library/react
- @testing-library/jest-dom

Testele acoperă:
- randarea titlului aplicației;
- existența input-ului de căutare;
- funcționarea butonului Search;
- apelarea API-ului la pornire (tags=nature);
- apelarea API-ului cu termen introdus de utilizator;
- funcționarea paginării;
- schimbarea temei și salvarea în LocalStorage.

Rulare teste:
npm run test

Rezultat:
7 teste trecute
0 erori

## 9.Deployment
Aplicația a fost deployată folosind Vercel, cu integrare directă din GitHub.

Link aplicație live:
https://flickr-photo-search-mu.vercel.app/

Deployment-ul demonstrează funcționarea aplicației într-un mediu de producție real, accesibil public.

## 10. Concluzie
Aplicația Flickr Photo Search reprezintă o implementare practică a unei aplicații web moderne, construită folosind tehnologii actuale din ecosistemul JavaScript. 
Proiectul se bazează pe integrarea unui serviciu extern pentru preluarea datelor și pe afișarea acestora într-o interfață grafică intuitivă și responsive.

În cadrul aplicației au fost puse în practică concepte esențiale precum organizarea aplicației pe componente, gestionarea stării, tratarea interacțiunilor utilizatorului și optimizarea experienței de utilizare. De asemenea, au fost abordate aspecte legate de persistența datelor la nivel de client, testarea funcționalităților și publicarea aplicației într-un mediu de producție.

Aplicația este funcțională în forma actuală și oferă o bază solidă pentru dezvoltări ulterioare, putând fi extinsă cu funcționalități suplimentare sau optimizări în funcție de cerințe viitoare. Prin structura și implementarea sa, proiectul reflectă utilizarea coerentă a tehnologiilor web moderne și a principiilor de dezvoltare a aplicațiilor client-side.