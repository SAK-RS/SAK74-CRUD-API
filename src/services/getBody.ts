import type { IncomingMessage } from "node:http";
import { User } from "../types";

export const getBody = (req: IncomingMessage) => {
  return new Promise<Exclude<User, "id">>((res, rej) => {
    // throw Error("uuuuuuups");
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const parsedBody = JSON.parse(body) as Exclude<User, "id">;
      if (!parsedBody.age || !parsedBody.username || !parsedBody.hobbies) {
        rej(new BodyError());
      }
      res(parsedBody);
    });
    req.on("error", rej);
  });
};

export class BodyError extends Error {
  message = "Body does not contain required fields...";
}
