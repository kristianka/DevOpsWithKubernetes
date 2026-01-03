interface Todo {
  id: number;
  text: string;
}

// in-memory todo storage
let todos: Todo[] = [
  { id: 1, text: "Learn Kubernetes (from server)" },
  { id: 2, text: "Release SaaS (from server)" },
  { id: 3, text: "Walk 10 000 steps everyday (from server)" }
];

let nextId = 4;

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

export const getTodos = (req: Request) => {
  return jsonResponse(todos);
};

export const addTodo = async (req: Request) => {
  try {
    const body = (await req.json()) as { text: string };

    // basic validity
    if (!body.text || typeof body.text !== "string" || body.text.trim() === "") {
      return jsonResponse({ error: "Todo text is required" }, 400);
    }

    const newTodo: Todo = {
      id: nextId++, // in perfect world uuid
      text: body.text.trim()
    };

    todos.push(newTodo);

    return jsonResponse({ success: true, todos }, 201);
  } catch (error) {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }
};
