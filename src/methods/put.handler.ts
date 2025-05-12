import { RequestListener } from "node:http";
import { BodyError, getBody } from "../services/getBody";
import { setResponse } from "../services/setResponse";
import { handleError } from "../services/handleError";
import data, { NotFoundError } from "../data/users";
import { getId } from "../services/getId";
import { validate } from "uuid";
import cluster from "node:cluster";

export const putHandler: RequestListener = async (req, resp) => {
  try {
    const id = getId(req.url);
    if (!id || !validate(id)) {
      handleError(400, "Missed or invalid id...", resp);
      return;
    }
    const body = await getBody(req);
    if (cluster.isWorker) {
      process.send && process.send({ action: "updateUser", id, user: body });
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
            body: JSON.stringify(msg),
            headers: { "content-type": "application/json" },
          });
        }
      });
    } else {
      setResponse({
        code: 200,
        resp,
        body: JSON.stringify(data.updateUser(id, body)),
        headers: { "content-type": "application/json" },
      });
    }
  } catch (err) {
    const isBodyError = err instanceof BodyError;
    const notExist = err instanceof NotFoundError;

    handleError(
      isBodyError ? 400 : notExist ? 404 : 500,
      isBodyError || notExist ? err.message : "Unknown error...",
      resp
    );
  }
};
