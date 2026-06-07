# CS Knowledge Map — FMI UVT

An interactive, multilevel knowledge map of Computer Science areas, built with **Next.js 14**, **TypeScript**, and **TailwindCSS**.

Covers global CS areas (ACM/IEEE CS2023 Curriculum + Denning's discipline classification) and the local dimension of the **Department of Computer Science at the West University of Timișoara (UVT)**.

---

## Features

- **Obsidian-style node graph** — pan, zoom, click to explore
- **Keyboard navigation** — `↑↓←→` move between nodes, `Enter` selects, `Tab` cycles, `Esc` closes
- **Per-node detail panel** showing:
  - Activities: Theory / Experiment / Design
  - Open and solved problems with examples
  - Key people in each area
  - Important venues (journals & conferences)
  - Local UVT dimension (courses, research groups, programs)
- **Filters** by cluster (Core CS, Systems, AI/ML, UVT Local, …) and study level (BSc / MSc / PhD)
- **Full-text search** across node labels, people, and venues
- **Bilingual** — toggle EN ↔ RO at any time
- **Minimap** — always-visible viewport overview
- **Data-driven** — all content lives in `data/cs-map.json`, easy to extend

---

## Project structure

```
cs-map/
├── app/
│   ├── globals.css          # global styles & CSS variables
│   ├── layout.tsx           # Next.js root layout
│   └── page.tsx             # entry page
├── components/
│   ├── CSMap.tsx            # main orchestrator (state, keyboard, filters)
│   ├── GraphCanvas.tsx      # canvas renderer (nodes, edges, minimap)
│   ├── NodePanel.tsx        # right-side detail panel
│   ├── Toolbar.tsx          # top bar (search, filters, lang)
│   └── Legend.tsx           # floating legend
├── data/
│   └── cs-map.json          # ALL content — nodes, edges, metadata
├── types/
│   └── map.ts               # TypeScript interfaces
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Getting started

### Prerequisites
- **Node.js 18+** — download from https://nodejs.org
- **npm** (comes with Node.js)

### Install & run

```bash
# 1. Navigate into the project
cd cs-map

# 2. Install dependencies (~30 seconds)
npm install

# 3. Start the development server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Build for production

```bash
npm run build
npm start
```

---

## Extending the map

All content is in **`data/cs-map.json`**. To add a new node:

```json
{
  "id": "MyArea",
  "label": "My Area",
  "labelRO": "Domeniul Meu",
  "x": 420, "y": 300, "r": 28,
  "color": "#534AB7", "textColor": "#ffffff",
  "cluster": "core",
  "activities": ["theory", "design"],
  "tagline": "Short description",
  "taglineRO": "Descriere scurtă",
  "connections": [
    { "to": "AL", "type": "uses" }
  ],
  "problems": [
    { "title": "Problem name", "open": true, "example": "Concrete example…" }
  ],
  "people": ["Name 1", "Name 2"],
  "venues": ["Conference 1", "Journal 1"],
  "uvt": "UVT-specific note in English.",
  "uvtRO": "Notă specifică UVT în română.",
  "studyLevel": ["bachelor", "master"]
}
```

Positions (`x`, `y`) are in graph-world coordinates. The canvas centers automatically.

---

## Data sources

- **Denning, P.J.** (2005). *Computer Science: The Discipline.* Encyclopedia of Computer Science.
- **ACM/IEEE-CS** (2023). *Computer Science Curricula 2023 (CS2023).* https://csed.acm.org
- **IEEE CS** Curriculum guidelines
- **FMI-UVT** official study programs — https://www.math.uvt.ro

---

## Assignment context

Built for the *Multilevel Map of Computer Science* assignment at FMI-UVT.  
The map exhibits, for each area:
- Main activities (theory, experiment, design) — Denning's classification
- Relations/connections to other areas (dependency, influence, etc.)
- Important problems and open problems with intuitive examples
- Important people
- Important venues (journals, conferences)
- Both the **local dimension** (FMI-UVT programs, courses, research groups) and the **global dimension**
