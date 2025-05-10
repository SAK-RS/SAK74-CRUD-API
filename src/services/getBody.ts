import type { IncomingMessage } from "node:http";
import { User } from "../types";
import { validateBody } from "../utils/validateBody";

export const getBody = (req: IncomingMessage) => {
  return new Promise<Exclude<User, "id">>((res, rej) => {
    // throw Error("uuuuuuups");
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        if (!body) {
          rej(new BodyError());
        }
        const parsedBody = JSON.parse(body) as Exclude<User, "id">;
        if (!validateBody(parsedBody)) {
          rej(new BodyError());
        }
        res(parsedBody);
      } catch {
        rej();
      }
    });
    req.on("error", rej);
  });
};

export class BodyError extends Error {
  message = "Body does not contain required fields...";
}
