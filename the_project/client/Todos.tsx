import { useEffect, useState } from "react";

interface Todo {
  id: number;
  text: string;
  completed?: boolean;
}

export const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use current page origin + base path for API calls
  const apiBase = `${window.location.origin}${process.env.CLIENT_API || ""}`;

  const fetchTodos = async () => {
    try {
      // fetch todos from server
      const res = await fetch(`${apiBase}/todos`);
      if (!res.ok) {
        throw new Error("Failed to fetch todos");
      }
      const data = await res.json();
      setTodos(data.todos);
    } catch (error) {
      setError("Failed to fetch todos");
      console.error("Error fetching todos:", error);
      setTodos([]);
    }
  };

  useEffect(() => {
    fetchTodos();
    setLoading(false);
  }, []);

  console.log("Todos rendered with:", todos);

  const addTodo = async (text: string) => {
    try {
      const res = await fetch(`${apiBase}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!res.ok) {
        throw new Error("Failed to add todo");
      }

      const data = await res.json();
      setTodos((prevTodos) => [...prevTodos, data.newTodo]);
    } catch (error) {
      setError("Failed to add todo");
      console.error("Error adding todo:", error);
    }
  };

  const updateTodo = async (id: number) => {
    try {
      const res = await fetch(`${apiBase}/todos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      if (!res.ok) {
        throw new Error("Failed to update todo");
      }

      const data = await res.json();
      setTodos((prevTodos) => prevTodos.map((todo) => (todo.id === id ? data.updatedTodo : todo)));
    } catch (error) {
      setError("Failed to update todo");
      console.error("Error updating todo:", error);
    }
  };

  const unCompletedTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  const renderTodoItem = (t: Todo, index: number) => (
    <li key={t.id}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span>{t.text}</span>
        <button onClick={() => updateTodo(t.id)}>{t.completed ? "Undo" : "Mark Complete"}</button>
      </div>
    </li>
  );

  return (
    <div>
      <div style={{ marginTop: "1rem" }}>
        <input
          type="text"
          title="New todo"
          maxLength={140}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          value={input}
          onClick={() => {
            addTodo(input);
            setInput("");
          }}
        >
          {" "}
          Add Todo
        </button>
        <button disabled={loading} onClick={fetchTodos}>
          Refresh
        </button>
      </div>
      {loading && <p>Loading todos...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h2>Todos</h2>
      <ul>{unCompletedTodos?.map((t, index) => renderTodoItem(t, index))}</ul>
      {unCompletedTodos.length === 0 && <p>No todos available. Add a new todo!</p>}
      <h2>Completed Todos</h2>
      {completedTodos.length === 0 && <p>No completed todos yet!</p>}
      <ul>{completedTodos?.map((t, index) => renderTodoItem(t, index))}</ul>
    </div>
  );
};
