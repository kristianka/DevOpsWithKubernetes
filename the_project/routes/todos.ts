import { pool } from "../src/db";

interface Todo {
  id: number;
  text: string;
  completed?: boolean;
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
    console.log(`[TODO REQUEST] Fetching all todos`);

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
      console.log("[TODO RESPONSE] No todos found");
      return jsonResponse({ todos: [] });
    }

    console.log(`[TODO RESPONSE] Fetched ${res.rowCount} todos`);
    return jsonResponse({ todos: res.rows });
  } catch (error) {
    console.error("[TODO ERROR] Error fetching todos:", error);
    return jsonResponse({ error: "Failed to fetch todos" }, 500);
  }
};

export const addTodo = async (req: Request) => {
  try {
    const body = (await req.json()) as { text: string };

    // Log incoming request
    console.log(`[TODO REQUEST] Received todo request: "${body.text || "(empty)"}"`);

    // basic validity
    if (!body.text || typeof body.text !== "string" || body.text.trim() === "") {
      console.log(`[TODO REJECTED] Empty or invalid todo text`);
      return jsonResponse({ error: "Todo text is required" }, 400);
    }

    const trimmedText = body.text.trim();

    // Check character limit (140 characters)
    if (trimmedText.length > 140) {
      console.log(
        `[TODO REJECTED] Todo too long: ${trimmedText.length} characters (limit: 140). Text: "${trimmedText}"`
      );
      return jsonResponse(
        {
          error: "Todo text must be 140 characters or less",
          length: trimmedText.length,
          limit: 140
        },
        400
      );
    }

    const res = await pool.query(
      `
      INSERT INTO todo (text, completed, created_at, updated_at)
      VALUES ($1, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, text, completed, created_at, updated_at
    `,
      [trimmedText]
    );

    const newTodo: Todo = res.rows[0];
    console.log(
      `[TODO ACCEPTED] Added new todo (ID: ${newTodo.id}, length: ${trimmedText.length}): "${trimmedText}"`
    );
    return jsonResponse({ success: true, newTodo }, 201);
  } catch (error) {
    console.error("[TODO ERROR] Error adding todo:", error);
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }
};

export const updateTodo = async (req: Request) => {
  try {
    const body = (await req.json()) as { id: number };

    // Log incoming request
    console.log(`[TODO REQUEST] Received update todo request: "${body.id || "(empty)"}"`);

    // basic validity
    if (!body.id || typeof body.id !== "number") {
      console.log(`[TODO REJECTED] Empty or invalid todo id`);
      return jsonResponse({ error: "Todo id is required" }, 400);
    }

    // this should be sanitazed/validated further
    const validatedId = body.id;

    // just toggle for now if marked as completed
    const res = await pool.query(
      `
      UPDATE todo
      SET
        completed = NOT completed,
        updated_at = CURRENT_TIMESTAMP
      WHERE
      id = $1
      RETURNING
        id,
        text,
        completed,
        created_at,
        updated_at;
    `,
      [validatedId]
    );

    const updatedTodo: Todo = res.rows[0];
    console.log(`[TODO ACCEPTED] Updated todo (ID: ${updatedTodo.id}): "${updatedTodo.text}"`);
    return jsonResponse({ success: true, updatedTodo }, 201);
  } catch (error) {
    console.error("[TODO ERROR] Error updating todo:", error);
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }
};
