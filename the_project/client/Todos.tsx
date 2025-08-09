import { useState } from "react";

const defaultTodos = [
  "Learn Kubernetes",
  "Release SaaS",
  "Walk 10 000 steps everyday",
];

export const Todos = () => {
  const [todos, setTodos] = useState<string[]>(defaultTodos);

  return (
    <div>
      <div style={{ marginTop: "1rem" }}>
        <input type="text" title="New todo" maxLength={140} />
        <button>Add todo</button>
      </div>
      <div>
        {todos.map((t, index) => (
          <li key={index}>{t}</li>
        ))}
      </div>
    </div>
  );
};
