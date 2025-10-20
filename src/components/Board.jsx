import Cell from "./Cell";

function Board({ cells, onCellClick, disabled }) {
  return (
    <div className={`board ${disabled ? "disabled" : ""}`}>
      {cells.map((value, i) => (
        <Cell
          key={i}
          value={value}
          disabled={disabled || value !== null}
          onClick={() => !disabled && value === null && onCellClick(i)}
        />
      ))}
    </div>
  );
}
export default Board;
