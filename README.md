# Ultimate Tic-Tac-Toe Online

> Real-time multiplayer Ultimate Tic-Tac-Toe with React, Vite, and Socket.IO

https://github.com/klasnich881/ultimate-tic-tac-toe

Transform a classic board-game twist into a modern web experience. Two players (or two browser tabs) are matched instantly and play on nine interconnected tic-tac-toe boards. A Node/Express Socket.IO service enforces the rules, synchronizes the game state, and broadcasts turn updates.

---

##  Demo

<!-- Replace with GIF or screenshot -->

![Ultimate Tic-Tac-Toe UI](docs/screenshot.png)

---

##  Highlights

- **Instant matchmaking:** Players auto-join the next available room—no manual codes required.
- **Authoritative server:** A shared game state (boards, winners, active board) is validated server-side to prevent desyncs.
- **Ultimate Tic-Tac-Toe logic:** Each move dictates the next active mini-board, with win detection on both micro and macro boards.
- **Modern UI/UX:** Responsive layout, disabled/active board indicators, and real-time status messages.
- **Production ready:** Clean separation of client/server, environment-based configuration, and linted React codebase.

---

##  Tech Stack

| Layer    | Technologies                         |
| -------- | ------------------------------------ |
| Frontend | React 19, Vite, CSS                  |
| Backend  | Node.js 20+, Express 5, Socket.IO 4  |
| Tooling  | ESLint 9, npm 10, Vite build tooling |

---

##  Getting Started

### 1. Prerequisites

- **Node.js 20.19+** (or 22.12+)
- npm 10+ (ships with Node 20)

Verify versions:

```bash
node -v
npm -v
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Locally

Start the Socket.IO backend and Vite frontend in separate terminals:

```bash
npm run server   # http://localhost:3001
npm run dev      # http://localhost:5173
```

Open two browser windows (or a window + incognito) on `http://localhost:5173`. You’ll be matched instantly—one player is X, the other O.

### 4. Production Build

```bash
npm run build
```

Deploy `dist/` to your static host and run the `src/server/index.js` backend on your Node host (Render, Railway, Fly.io, etc.). Configure the client with the backend URL via environment variables.

---

## ⚙️ Configuration

| Variable          | Applies to | Description                                                         |
| ----------------- | ---------- | ------------------------------------------------------------------- |
| `VITE_SOCKET_URL` | Client     | Optional Socket.IO endpoint override (e.g. in production)           |
| `CLIENT_ORIGIN`   | Server     | Allowed origin for Socket.IO CORS (default `http://localhost:5173`) |

Create a `.env` (client) or server-side `.env` file as needed and keep secrets out of version control.

---

##  npm Scripts

| Command           | Description                            |
| ----------------- | -------------------------------------- |
| `npm run dev`     | Start Vite dev server with HMR         |
| `npm run build`   | Generate production bundle             |
| `npm run preview` | Preview the build locally              |
| `npm run server`  | Launch the Socket.IO + Express backend |
| `npm run lint`    | Run ESLint across the project          |

---

##  Project Structure

```
src/
├─ components/        # React components (BigBoard, Board, Cell, Header)
├─ server/            # Socket.IO + Express server
├─ assets/            # Static assets and icons
├─ App.jsx            # Root UI
├─ main.jsx           # React entry point
└─ index.css / App.css
```

---

##  Implementation Notes

- **State Sync:** Client renders entirely from server emissions. Moves emit only `{ boardIndex, cellIndex }`; the server updates and re-broadcasts authoritative state.
- **Active Board Logic:** Server identifies closed boards (won/draw) to reopen the selection, mirroring official Ultimate Tic-Tac-Toe rules.
- **Resilience:** If a player disconnects, the opponent is notified and returned to the matchmaking queue.
- **UI Feedback:** Boards turn semi-transparent when disabled, and buttons are disabled when cells are filled or it’s not your turn.

---

##  Roadmap

- Rematch flow with persistent room codes.
- Spectator mode with move history and undo/redo for analysis.
- Ratings/leaderboard backed by a simple datastore (Redis/Postgres).
- Progressive Web App (PWA) support for mobile play.

---

##  License

MIT © 2025 klasnich881
