import test, { describe } from "node:test";
import assert from "node:assert";
import { server } from "../src/server";
import type { User } from "../src/types";
import { makeRequest } from "./utils";
import { PORT } from "../_setup";

describe("API testing", () => {
  let createdUser: User;
  test.before(async () => {
    await new Promise<void>((resolve) => server.listen(PORT, resolve));
  });

  test.after(() => {
    server.close();
  });

  test("GET /api/users - expect empty array", async () => {
    const res = await makeRequest({
      path: `/api/users`,
      method: "GET",
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body, "[]");
  });

  test("POST /api/users - create a new user", async () => {
    const newUser: Omit<User, "id"> = {
      username: "John",
      age: 30,
      hobbies: ["reading"],
    };
    let res = await makeRequest({
      path: "/api/users",
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(newUser),
    });
    assert.strictEqual(res.status, 201);
    createdUser = JSON.parse(res.body);
    assert.strictEqual(createdUser.username, newUser.username);
    assert.strictEqual(createdUser.age, newUser.age);
    assert.deepStrictEqual(createdUser.hobbies, newUser.hobbies);
    assert.ok(createdUser.id);
  });

  test("GET /api/users/{id} - retrieve created user", async () => {
    const userId = createdUser.id;
    const res = await makeRequest({
      path: `/api/users/${userId}`,
      method: "GET",
    });
    assert.strictEqual(res.status, 200);
    const fetchedUser = JSON.parse(res.body);
    assert.deepStrictEqual(fetchedUser, createdUser);
  });

  test("PUT /api/users/{id} - update the user", async () => {
    const userId = createdUser.id;
    const updatedUserData = {
      username: "John Updated",
      age: 35,
      hobbies: ["writing"],
    };
    const res = await makeRequest({
      path: `/api/users/${userId}`,
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(updatedUserData),
    });
    assert.strictEqual(res.status, 200);
    const updatedUser = JSON.parse(res.body);
    assert.ok(updatedUser.id);
    assert.strictEqual(updatedUser.id, userId);
    assert.strictEqual(updatedUser.username, updatedUserData.username);
    assert.strictEqual(updatedUser.age, updatedUserData.age);
    assert.deepStrictEqual(updatedUser.hobbies, updatedUserData.hobbies);
  });

  test("DELETE /api/users/{id} - delete the user", async () => {
    const res = await makeRequest({
      path: `/api/users/${createdUser.id}`,
      method: "DELETE",
    });
    assert.strictEqual(res.status, 204);
  });

  test("GET /api/users/{id} again - expect not found (404)", async () => {
    const res = await makeRequest({
      path: `/api/users/${createdUser.id}`,
      method: "GET",
    });
    assert.strictEqual(res.status, 404);
  });

  test("GET /api/users/{id} wrong uuid", async () => {
    const res = await makeRequest({
      path: `/api/users/asd`,
      method: "GET",
    });
    assert.strictEqual(res.status, 400);
  });

  test("GET /api/users/{id} not existing user", async () => {
    const res = await makeRequest({
      path: `/api/users/21fab6b9-0f7e-476c-b7ea-aed2369aa4c0`,
      method: "GET",
    });
    assert.strictEqual(res.status, 404);
  });
});
