import Header from "./components/Header";
import BigBoard from "./components/BigBoard";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Header title="Ultimate Tic-Tac-Toe" />
      <BigBoard />
    </div>
  );
}

export default App;
