import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

// Add this: In-memory storage for todos
const todos: { id: number; task: string }[] = [];
let nextId = 1;

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);

  // CORS headers
  const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  // Handle different endpoints
  if (url.pathname === "/") {
    const file = await Deno.readFile("index.html");
    return new Response(file, {
      headers: { "content-type": "text/html" },
    });
  }

  // GET /todos - List all todos
  if (url.pathname === "/todos" && request.method === "GET") {
    return new Response(JSON.stringify(todos), { headers });
  }

  // POST /todos - Create new todo
  if (url.pathname === "/todos" && request.method === "POST") {
    const body = await request.json();
    const todo = {
      id: nextId++,
      task: body.task,
    };
    todos.push(todo);
    return new Response(JSON.stringify(todo), { headers });
  }

  // DELETE /todos/:id - Delete a todo
  if (url.pathname.match(/^\/todos\/\d+$/) && request.method === "DELETE") {
    const id = parseInt(url.pathname.split("/")[2]);
    const index = todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      todos.splice(index, 1);
      return new Response(null, { status: 204, headers });
    }
  }

  return new Response("Not Found", { status: 404 });
};

console.log("HTTP webserver running. Access it at: http://localhost:8000/");
await serve(handler, { port: 8002 }); // Make sure this port matches what you're using in the frontend
