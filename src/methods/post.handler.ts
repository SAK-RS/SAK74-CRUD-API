import type { RequestListener } from "node:http";
import { BodyError, getBody } from "../services/getBody";
import { setResponse } from "../services/setResponse";
import data from "../data/users";
import { handleError } from "../services/handleError";
import cluster from "node:cluster";

export const postHandler: RequestListener = async (req, resp) => {
  try {
    const body = await getBody(req);
    // throw Error("aaaaa");
    if (cluster.isWorker) {
      process.send && process.send({ action: "addUser", user: body });
      process.once("message", (msg) => {
        setResponse({
          code: 201,
          resp,
          body: JSON.stringify(msg),
          headers: { "content-type": "application/json" },
        });
      });
    } else {
      setResponse({
        code: 201,
        resp,
        body: JSON.stringify(data.addUser(body)),
        headers: { "content-type": "application/json" },
      });
    }
  } catch (err) {
    const isBodyError = err instanceof BodyError;
    handleError(
      isBodyError ? 400 : 500,
      isBodyError ? err.message : "Unknown error...",
      resp
    );
  }
};
