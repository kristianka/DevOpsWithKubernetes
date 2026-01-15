import { pool } from "../src/db";

interface Todo {
  id: number;
  text: string;
}

// helper to create responses with common headers
const jsonResponse = (data: any, status: number = 200): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
};

export const getTodos = async (req: Request) => {
  try {
    const res = await pool.query(`
        SELECT
            id,
            text,
            completed,
            created_at,
            updated_at
        FROM
            todo
      `);

    if (res.rowCount === 0) {
      console.log("No todos found");
      return jsonResponse({ todos: [] });
    }

    console.log(`Fetched ${res.rowCount} todos`);
    return jsonResponse({ todos: res.rows });
  } catch (error) {
    console.error("Error fetching todos:", error);
    return jsonResponse({ error: "Failed to fetch todos" }, 500);
  }
};

export const addTodo = async (req: Request) => {
  try {
    const body = (await req.json()) as { text: string };

    // basic validity
    if (!body.text || typeof body.text !== "string" || body.text.trim() === "") {
      return jsonResponse({ error: "Todo text is required" }, 400);
    }

    const res = await pool.query(
      `
      INSERT INTO todo (text, completed, created_at, updated_at)
      VALUES ($1, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, text, completed, created_at, updated_at
    `,
      [body.text.trim()]
    );

    const newTodo: Todo = res.rows[0];
    console.log("Added new todo:", newTodo);
    return jsonResponse({ success: true, newTodo }, 201);
  } catch (error) {
    console.error("Error adding todo:", error);
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }
};
