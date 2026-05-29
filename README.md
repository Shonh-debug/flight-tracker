# ✈️ Flight Tracker — Real-Time Flight Command Center

A real-time flight tracking web application that lets you look up any commercial flight by its flight number and see live status, departure/arrival info, delay data, and detailed boarding-pass-style flight pages.

**Live Site:** [flight-tracker-plum.vercel.app](https://flight-tracker-plum.vercel.app)

---

## 📋 Overview

Flight Tracker is a full-stack web application that integrates the **Aviation Stack API** to retrieve and display real-time global flight data. Users can search for any flight by its IATA or ICAO code, view a live summary dashboard, and click into a full flight detail page showing departure/arrival information, time zone-accurate schedules, delay badges, and color-coded status indicators.

### Key Features

- 🔍 **Flight Search** — Enter any IATA (e.g. `AA123`) or ICAO (e.g. `ACA228`) flight number
- 📊 **Live Dashboard** — Summary stats cards (Total / Active / Landed / Delayed / Cancelled / Scheduled)
- 🕐 **Timezone-Accurate Times** — Scheduled times displayed in the local timezone of each airport
- ⚠️ **Delay Badges** — Real-time delay in minutes shown alongside scheduled times, with strikethrough and estimated time
- 🎨 **Color-Coded Statuses** — Active (blue), Scheduled (slate), Landed (green), Cancelled (red), Diverted (purple), Incident (orange)
- 📄 **Flight Detail Page** — Full boarding-pass-style breakdown per flight with airport codes, terminal, gate, and delay info
- 📅 **Google Calendar Integration** — Add any flight to Google Calendar via the calendar icon
- 📱 **Responsive Design** — Fully responsive across desktop and mobile

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 16 (App Router)** | React framework — routing, server components, and API routes |
| **TypeScript** | Type-safe development across all components and API handlers |
| **Tailwind CSS** | Utility-first CSS framework for styling and responsive design |
| **Inter** (Google Font) | Primary UI typeface |
| **JetBrains Mono** (Google Font) | Monospace font for flight numbers, times, and codes |

### Backend

| Technology | Purpose |
|---|---|
| **Next.js API Routes** | Serverless backend endpoints (`/api/flights`) — act as a secure proxy to Aviation Stack |
| **Aviation Stack API** | Third-party REST API providing real-time global flight data |
| **Node.js `fetch`** | Used within API routes to query the Aviation Stack service |
| **`Intl.DateTimeFormat`** | Native JavaScript API used for timezone-accurate date/time formatting |

### Infrastructure & Hosting

| Technology | Purpose |
|---|---|
| **Vercel** | Production hosting — auto-deploys on every push to the `main` GitHub branch |
| **GitHub** | Source control and CI/CD trigger (`Shonh-debug/flight-tracker`) |
| **Vercel Environment Variables** | Securely stores the `AVIATION_STACK_API_KEY` on the server — never exposed to the browser |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── flights/
│   │       └── route.ts        # Serverless API route — proxies Aviation Stack
│   ├── flights/
│   │   └── [id]/
│   │       └── page.tsx        # Flight detail page (dynamic route)
│   ├── layout.tsx              # Root layout with fonts and metadata
│   ├── page.tsx                # Dashboard homepage
│   └── globals.css             # Global styles and custom badge classes
├── components/
│   ├── DashboardShell.tsx      # Layout wrapper (sidebar + topbar + main)
│   ├── FlightSearch.tsx        # Shared Flight type + legacy search component
│   ├── FlightTable.tsx         # Results table with delay badges and row navigation
│   ├── Sidebar.tsx             # Collapsible sidebar navigation
│   ├── StatsCards.tsx          # Summary stat cards (total, active, delayed, etc.)
│   └── TopBar.tsx              # Top search bar and header
├── locales/                    # Support for 6 different languages 
│   ├── en.ts                  
│   ├── de.ts        
│   ├── fr.ts         
│   ├── index.ts             
│   ├── ru.ts
│   ├── vi.ts           
│   └── zh.ts             
```

---

## API Integration

The app uses the **Aviation Stack** `/v1/flights` endpoint:

```
http://api.aviationstack.com/v1/flights?access_key=KEY&flight_iata=AA123
```

The Next.js API route (`/api/flights`) acts as a **secure middleware layer** between the browser and Aviation Stack — the API key is never sent to the client.

**Smart flight code detection:** The API route automatically detects whether the user typed an IATA code (2-letter airline prefix, e.g. `WS128`) or an ICAO code (3-letter prefix, e.g. `ACA228`) and switches the query parameter accordingly (`flight_iata` vs `flight_icao`).

**Data returned per flight:**
- Flight number, airline name, flight date
- Departure & arrival airport names and IATA codes
- Scheduled times (in local airport timezone with abbreviation, e.g. `19:30 PDT`)
- Estimated times (only shown when different from scheduled)
- Delay in minutes for departure and arrival
- Terminal and gate information
- Airplane altitude data 
- Flight status (`active`, `scheduled`, `landed`, `cancelled`, `diverted`, `incident`)

---

## Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shonh-debug/flight-tracker.git
   cd flight-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your environment variable**

   Copy the example file and add your Aviation Stack API key:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local`:
   ```
   AVIATION_STACK_API_KEY=your_key_here
   ```
   > A free API key can be obtained at [aviationstack.com](https://aviationstack.com/signup/free) (100 requests/month on the free plan).

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment (Vercel)

The app is continuously deployed via **Vercel** linked to the GitHub repository. Every push to the `main` branch triggers an automatic redeploy.

**Environment variable required on Vercel:**

| Variable | Description |
|---|---|
| `AVIATION_STACK_API_KEY` | Your Aviation Stack API key (set in Vercel Dashboard → Project → Settings → Environment Variables) |

The API route is configured with `export const dynamic = 'force-dynamic'` to ensure flight data is never cached and always fetched fresh.

---

## 📄 License

This project is for personal/educational use. Flight data is provided by [Aviation Stack](https://aviationstack.com).
