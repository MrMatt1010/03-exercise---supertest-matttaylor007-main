const request = require("supertest");
const app = require("./app");
const pool = require("./db");

describe("Todos API", () => {
  afterEach(async () => {
    await pool.query("DELETE from todo");
  });

  afterAll(() => {
    pool.end();
  });

  test("GET /todos: WHEN there are todos in the database THEN return status 200 and an array of todos", async () => {
    await pool.query(`
      INSERT INTO
        todo (todo_id, description)
      VALUES
        (1, 'Start working on my project')  
    `);
    const expectedResponseBody = [
      {
        todo_id: 1,
        description: "Start working on my project",
      },
    ];
    const response = await request(app)
      .get("/api/todos")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedResponseBody);
  });

  test("GET /todos: WHEN there are no todos in the database THEN return status 200 and an empty array", async () => {
    const expectedResponseBody = [];
    const response = await request(app)
      .get("/api/todos")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedResponseBody);
  });

  test("POST /api/todos should create a new todo THEN return status 201 and the new todo with an id", async () => {
    const todoDescription = "More work on Project";
    const expectedBody = "More work on Project";

    const response = await request(app)
      .post("/api/todos")
      .send({ description: todoDescription });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({ description: todoDescription })
    );
  });

  test("GET /todos/:id: WHEN a todo is searched for THEN return status 200 and the requested todo", async () => {
    const todoid = 2;
    await pool.query(`
      INSERT INTO
        todo (todo_id, description)
      VALUES
        (${todoid}, 'description')  
    `);
    const expectedResponseBody = {
      todo_id: todoid,
      description: "description",
    };

    const response = await request(app)
      .get(`/api/todos/${todoid}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedResponseBody);
  });

  test("PUT /todos/:id: WHEN a todo is updated and the request is well-formatted THEN return a status 200 and the updated todo", async () => {
    await pool.query(`
      INSERT INTO
        todo (todo_id, description)
      VALUES
        (1, 'Start working on my project')  
    `);
    const response = await request(app)
      .put("./api/todos/1")
      .send({ description: "blah" })
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toBe("todo was updated!");
  });

  test("PUT /todos/:id: WHEN the the client sends a request for a non exisent ID THEN return status 404", async () => {
    const response = await request(app)
      .put("/api/todos/1")
      .set("Accept", "application/json");

    expect(response.status).toBe(404);
  });

  test("PUT /todaos/:id: When the client send a request to update an existing todo AND the request is NOT well-formatted", async () => {
    await pool.query(`
      INSERT INTO
        todo (todo_id, description)
      VALUES
        (1, 'Start working on my project')  
    `);
    const response = await request(app)
      .put("/api.todos/1")
      .send({})
      .set("Accept", "application/json");

    expect(response.status).toBe(400);
    expect(response.body).toBe("bad request");
  });

  test("DELETE /todos/:id: WHEN the client sends a request to delete an existing todo id THEN delete the todo and return status 200", async () => {
    await pool.query(`
      INSERT INTO
        todo (todo_id, description)
      VALUES
        (1, 'Start working on my project')  
    `);
    const response = await request(app)
      .delete("/api/todos/1")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual("todo was deleted!");
  });
});
