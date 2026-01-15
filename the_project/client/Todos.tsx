import { useEffect, useState } from "react";

interface Todo {
  id: number;
  text: string;
}

export const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    try {
      // fetch todos from server
      const res = await fetch(`${process.env.CLIENT_API}/todos`);
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
      const res = await fetch(`${process.env.CLIENT_API}/todos`, {
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
      <div>
        {todos?.map((t, index) => (
          <li key={t.id}>{t.text}</li>
        ))}
      </div>
    </div>
  );
};
