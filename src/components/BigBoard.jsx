import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Board from "./Board";

const createEmptyBoards = () =>
  Array.from({ length: 9 }, () => Array(9).fill(null));

function BigBoard() {
  const [boards, setBoards] = useState(createEmptyBoards);
  const [boardWinners, setBoardWinners] = useState(() => Array(9).fill(null));
  const [activeBoard, setActiveBoard] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);
  const [draw, setDraw] = useState(false);
  const [myMark, setMyMark] = useState(null);
  const [status, setStatus] = useState("Connecting...");

  const socketRef = useRef(null);
  const markRef = useRef(null);

  useEffect(() => {
    const resolveSocketUrl = () => {
      if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
      const { protocol, hostname } = window.location;
      return `${protocol}//${hostname}:3001`;
    };

    const socket = io(resolveSocketUrl(), {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    const resetBoard = () => {
      setBoards(createEmptyBoards());
      setBoardWinners(Array(9).fill(null));
      setActiveBoard(null);
      setCurrentPlayer("X");
      setWinner(null);
      setDraw(false);
    };

    const applyState = (state) => {
      setBoards(state.boards);
      setBoardWinners(state.boardWinners);
      setActiveBoard(state.activeBoard);
      setCurrentPlayer(state.currentPlayer);
      setWinner(state.winner);
      setDraw(state.draw);
    };

    const describeStatus = (state) => {
      const mark = markRef.current;
      if (!mark) return "Assigning mark...";
      if (state.winner) {
        return state.winner === mark ? "You win!" : "Opponent wins!";
      }
      if (state.draw) return "Draw game!";
      return state.currentPlayer === mark ? "Your turn" : "Opponent's turn";
    };

    socket.on("connect", () => {
      setStatus("Looking for an opponent...");
      socket.emit("findGame");
    });

    socket.on("waitingForOpponent", () => {
      markRef.current = "X";
      setMyMark("X");
      resetBoard();
      setStatus("Waiting for an opponent...");
    });

    socket.on("gameStart", ({ mark, state }) => {
      markRef.current = mark;
      setMyMark(mark);
      applyState(state);
      setStatus(describeStatus(state));
    });

    socket.on("gameState", (state) => {
      applyState(state);
      setStatus(describeStatus(state));
    });

    socket.on("opponentLeft", () => {
      markRef.current = null;
      setMyMark(null);
      resetBoard();
      setStatus("Opponent left. Searching for a new game...");
      socket.emit("findGame");
    });

    socket.on("disconnect", () => {
      markRef.current = null;
      setMyMark(null);
      resetBoard();
      setStatus("Disconnected. Attempting to reconnect...");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const canPlay = Boolean(
    myMark && !winner && !draw && currentPlayer === myMark && socketRef.current
  );

  function handleCellClick(boardIndex, cellIndex) {
    if (!canPlay) return;
    if (activeBoard !== null && boardIndex !== activeBoard) return;
    if (boardWinners[boardIndex]) return;
    const board = boards[boardIndex];
    if (!board || board[cellIndex]) return;

    socketRef.current.emit("makeMove", { boardIndex, cellIndex });
  }

  return (
    <div className="big-board-wrapper">
      <div className="status-bar">
        <span>{status}</span>
        {myMark && <span>You are {myMark}</span>}
      </div>
      <div className="big-board">
        {boards.map((boardCells, i) => (
          <Board
            key={i}
            cells={boardCells}
            disabled={
              !canPlay ||
              !!boardWinners[i] ||
              (activeBoard !== null && activeBoard !== i)
            }
            onCellClick={(cellIndex) => handleCellClick(i, cellIndex)}
          />
        ))}
      </div>
    </div>
  );
}
export default BigBoard;
