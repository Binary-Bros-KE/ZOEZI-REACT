# Project: Nairobi Zoezi Institute Website  
**Purpose**: A dynamic website for Nairobi Zoezi Institute, including an admin panel for managing current students and alumni, with a server‐side API backend and a React front end.

## Tech Stack  
- Front-end: React + Tailwind CSS + React Icons + Framer Motion + React Toast  
- Back-end: (you’ll specify) — REST API endpoints, environment variable for server URL in `.env`  
- Environment configuration: Use `.env` file (e.g. `REACT_APP_API_URL`) for the server URL, so that all API calls use that base URL.  
- API calls: The front end must use the environment base URL and not hard-coded placeholder URLs. E.g.  
  ```js
  const apiUrl = process.env.REACT_APP_API_URL;
  const response = await fetch(`${apiUrl}/students`, { … });
src/
  components/
  pages/
  hooks/
  contexts/
  services/    // API calls, data fetching
  styles/      // Tailwind config, global styles
  utils/       // helpers
