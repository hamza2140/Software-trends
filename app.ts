import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

interface Todo {
  id: string;
  task: string;
}

const todos: Todo[] = [];

const router = new Router();

router
  .get("/", async (context) => {
    context.response.type = "text/html";
    context.response.body = await Deno.readFile("index.html");
  })
  .get("/todos", (context) => {
    context.response.body = todos;
  })
  .post("/todos", async (context) => {
    try {
      const body = await context.request.body().value;
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        task: body.task,
      };
      todos.push(newTodo);
      context.response.body = newTodo;
    } catch (error) {
      console.error('Error processing request:', error);
      context.response.status = 400;
      context.response.body = { error: "Invalid request body" };
    }
  })
  .delete("/todos/:id", (context) => {
    const id = context.params.id;
    const index = todos.findIndex((todo) => todo.id === id);
    if (index !== -1) {
      todos.splice(index, 1);
      context.response.status = 204;
    } else {
      context.response.status = 404;
    }
  });

const app = new Application();

// Add CORS middleware
app.use(oakCors());

// Add error handling middleware
app.use(async (context, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    context.response.status = 500;
    context.response.body = { error: "Internal server error" };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 }); 