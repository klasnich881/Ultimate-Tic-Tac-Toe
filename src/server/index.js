import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const PORT = Number(process.env.PORT) || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const games = new Map();
let waitingPlayer = null;

function createBoards() {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

function isBoardFull(board) {
  return board.every((cell) => cell !== null);
}

function calculateWinner(cells) {
  for (const [a, b, c] of WIN_LINES) {
    const value = cells[a];
    if (value && value !== "draw" && value === cells[b] && value === cells[c]) {
      return value;
    }
  }
  return null;
}

function serializeGame(game) {
  return {
    boards: game.boards.map((board) => [...board]),
    boardWinners: [...game.boardWinners],
    activeBoard: game.activeBoard,
    currentPlayer: game.currentPlayer,
    winner: game.winner,
    draw: game.draw,
  };
}

function sendState(game) {
  const payload = serializeGame(game);
  io.to(game.id).emit("gameState", payload);
}

io.on("connection", (socket) => {
  socket.on("findGame", () => {
    if (socket.data.gameId) {
      // Already in a game; ignore duplicate requests.
      return;
    }

    if (waitingPlayer && waitingPlayer.id !== socket.id) {
      const host = waitingPlayer;
      waitingPlayer = null;

      const gameId = `game-${host.id}-${socket.id}`;
      const game = {
        id: gameId,
        boards: createBoards(),
        boardWinners: Array(9).fill(null),
        activeBoard: null,
        currentPlayer: "X",
        winner: null,
        draw: false,
        players: {
          X: host.id,
          O: socket.id,
        },
      };

      games.set(gameId, game);

      host.join(gameId);
      socket.join(gameId);

      host.data.gameId = gameId;
      host.data.mark = "X";
      socket.data.gameId = gameId;
      socket.data.mark = "O";

      const snapshot = serializeGame(game);
      host.emit("gameStart", { mark: "X", state: snapshot });
      socket.emit("gameStart", { mark: "O", state: snapshot });
    } else {
      waitingPlayer = socket;
      socket.data.mark = "X";
      socket.emit("waitingForOpponent");
    }
  });

  socket.on("makeMove", ({ boardIndex, cellIndex }) => {
    const { gameId, mark } = socket.data;
    if (typeof boardIndex !== "number" || typeof cellIndex !== "number") return;
    if (!gameId || !mark) return;

    const game = games.get(gameId);
    if (!game || game.winner || game.draw) return;
    if (game.players[game.currentPlayer] !== socket.id) return;
    if (game.activeBoard !== null && boardIndex !== game.activeBoard) return;

    const board = game.boards[boardIndex];
    if (!board || board[cellIndex]) return;

    board[cellIndex] = mark;

    const smallWinner = calculateWinner(board);
    if (smallWinner) {
      game.boardWinners[boardIndex] = smallWinner;
    } else if (isBoardFull(board)) {
      game.boardWinners[boardIndex] = "draw";
    }

    const nextBoard = game.boards[cellIndex];
    const nextBoardClosed =
      nextBoard === undefined ||
      game.boardWinners[cellIndex] ||
      isBoardFull(nextBoard);
    game.activeBoard = nextBoardClosed ? null : cellIndex;

    const bigBoardWinner = calculateWinner(game.boardWinners);
    if (bigBoardWinner) {
      game.winner = bigBoardWinner;
    } else {
      const allClosed = game.boards.every(
        (b, i) => game.boardWinners[i] || isBoardFull(b)
      );
      if (allClosed) {
        game.draw = true;
      }
    }

    if (!game.winner && !game.draw) {
      game.currentPlayer = game.currentPlayer === "X" ? "O" : "X";
    }

    sendState(game);
  });

  socket.on("disconnect", () => {
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
      return;
    }

    const { gameId, mark } = socket.data ?? {};
    if (!gameId) return;

    const game = games.get(gameId);
    games.delete(gameId);
    if (!game) return;

    const opponentMark = mark === "X" ? "O" : "X";
    const opponentId = game.players[opponentMark];
    if (opponentId) {
      io.to(opponentId).emit("opponentLeft");
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server listening on port ${PORT}`);
});
