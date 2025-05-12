import type { RequestListener } from "node:http";
import { getId } from "../services/getId";
import { setResponse } from "../services/setResponse";
import data, { NotFoundError } from "../data/users";
import { validate } from "uuid";
import { handleError } from "../services/handleError";
import cluster from "node:cluster";

export const getHandler: RequestListener = (req, resp) => {
  const id = getId(req.url);
  if (!id) {
    if (cluster.isWorker) {
      process.send && process.send({ action: "getUsers" });
      process.once("message", (msg) => {
        setResponse({
          code: 200,
          resp,
          headers: { "content-type": "application/json" },
          body: JSON.stringify(msg),
        });
      });
    } else {
      setResponse({
        code: 200,
        resp,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data.getUsers()),
      });
    }
  } else if (!validate(id)) {
    handleError(400, "Invalid id...", resp);
  } else {
    try {
      if (cluster.isWorker) {
        process.send && process.send({ action: "getUserById", id });
        process.once("message", (msg) => {
          if ("error" in (msg as {})) {
            const notExist =
              (msg as { cause: string }).cause === new NotFoundError().message;
            handleError(
              notExist ? 404 : 500,
              (msg as { cause: string }).cause,
              resp
            );
          } else {
            setResponse({
              code: 200,
              resp,
              headers: { "content-type": "application/json" },
              body: JSON.stringify(msg),
            });
          }
        });
      } else {
        const user = data.getUserById(id);
        setResponse({
          code: 200,
          resp,
          headers: { "content-type": "application/json" },
          body: JSON.stringify(user),
        });
      }
    } catch (err) {
      const notExist = err instanceof NotFoundError;
      handleError(
        notExist ? 404 : 500,
        notExist ? err.message : "Unknown error...",
        resp
      );
    }
  }
};
