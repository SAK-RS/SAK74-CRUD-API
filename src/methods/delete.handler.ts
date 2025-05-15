import { RequestListener } from "node:http";
import { getId } from "../services/getId";
import { validate } from "uuid";
import { handleError } from "../services/handleError";
import { setResponse } from "../services/setResponse";
import data, { NotFoundError } from "../data/users";
import cluster from "node:cluster";

export const deleteHandler: RequestListener = (req, resp) => {
  const id = getId(req.url);
  if (!id || !validate(id)) {
    handleError(400, "Missed or invalid id...", resp);
    return;
  }
  try {
    if (cluster.isWorker) {
      process.send && process.send({ action: "deleteUser", id });
      process.once("message", (msg) => {
        if (msg === "Ok") {
          setResponse({ code: 204, resp });
        } else if ("error" in (msg as {})) {
          const notExist =
            (msg as { cause: string }).cause === new NotFoundError().message;
          handleError(
            notExist ? 404 : 500,
            (msg as { cause: string }).cause,
            resp
          );
        }
      });
    } else {
      data.deleteUser(id);
      setResponse({ code: 204, resp });
    }
  } catch (err) {
    if (err instanceof NotFoundError) {
      handleError(404, err.message, resp);
    } else {
      throw err;
    }
  }
};
