import {
  createServer,
  IncomingHttpHeaders,
  IncomingMessage,
  request,
  Server,
} from "node:http";
import test, { describe } from "node:test";
import assert from "node:assert";
import { serverListener } from "../src/server";
import { User } from "../src/types";

const PORT = Number(process.env.PORT || "3000");

const makeRequest: (params: {
  hostname?: string;
  port?: number;
  path: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
}) => Promise<{
  status?: number;
  headers: IncomingHttpHeaders;
  body: string;
}> = ({ hostname = "localhost", port = PORT, path, method, headers, body }) =>
  new Promise((resolve, reject) => {
    const reqInstance = request(
      { hostname, port, path, method, headers },
      (res: IncomingMessage) => {
        let chunks: string[] = [];
        res.on("data", (chunk: any) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: chunks.join(""),
          });
        });
      }
    );
    reqInstance.on("error", reject);
    if (body) {
      reqInstance.write(body);
    }
    reqInstance.end();
  });

describe("API testing", () => {
  let server: Server;
  test.before(async () => {
    server = createServer(serverListener);
    await new Promise<void>((resolve) => server.listen(PORT, resolve));
  });

  test.after(() => {
    server.close();
  });

  test(" GET /api/users - expect empty array", async () => {
    let res = await makeRequest({
      path: "/api/users",
      method: "GET",
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body, "[]");
  });

  test("POST / PUT / DELETE sequention", async () => {
    // POST /api/users - create a new user
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
    const createdUser = JSON.parse(res.body);
    assert.strictEqual(createdUser.username, newUser.username);
    assert.strictEqual(createdUser.age, newUser.age);
    assert.deepStrictEqual(createdUser.hobbies, newUser.hobbies);
    assert.ok(createdUser.id);

    // GET /api/users/{id} - retrieve created user
    const userId = createdUser.id;
    res = await makeRequest({
      path: `/api/users/${userId}`,
      method: "GET",
    });
    assert.strictEqual(res.status, 200);
    const fetchedUser = JSON.parse(res.body);
    assert.deepStrictEqual(fetchedUser, createdUser);

    // PUT /api/users/{id} - update the user
    const updatedUserData = {
      username: "John Updated",
      age: 35,
      hobbies: ["writing"],
    };
    res = await makeRequest({
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

    // DELETE /api/users/{id} - delete the user
    res = await makeRequest({
      path: `/api/users/${userId}`,
      method: "DELETE",
    });
    assert.strictEqual(res.status, 204);

    // GET /api/users/{id} again - expect not found (404)
    res = await makeRequest({
      path: `/api/users/${userId}`,
      method: "GET",
    });
    assert.strictEqual(res.status, 404);
  });
});
