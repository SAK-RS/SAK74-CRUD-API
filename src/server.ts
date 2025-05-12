import { createServer, type RequestListener } from "node:http";
import { handleError } from "./services/handleError";
import { getHandler } from "./methods/get.handler";
import { postHandler } from "./methods/post.handler";
import { putHandler } from "./methods/put.handler";
import { deleteHandler } from "./methods/delete.handler";

export const serverListener: RequestListener = (req, res) => {
  try {
    req.on("error", (err) => {
      handleError(400, err.message, res);
    });
    if (!req.url?.startsWith("/api/users")) {
      handleError(404, "Wrong path!", res);
      return;
    }

    if (!req.method || !(req.method in handlers)) {
      handleError(405, "Method not allowed!", res);
      return;
    }
    handlers[req.method](req, res);
  } catch {
    handleError(500, "Server error!", res);
  }
};

export const server = createServer(serverListener);

const methods = ["GET", "POST", "PUT", "DELETE"] as const;
const handlers: { [k in (typeof methods)[number]]: RequestListener } = {
  GET: getHandler,
  POST: postHandler,
  PUT: putHandler,
  DELETE: deleteHandler,
};
