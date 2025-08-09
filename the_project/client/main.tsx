import { createRoot } from "react-dom/client";
import { RandomImage } from "./RandomImage";
import { Todos } from "./Todos";

function App() {
  return (
    <div>
      <h1>The Project App</h1>
      <RandomImage />
      <Todos />
    </div>
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
