import type { RequestListener } from "node:http";
import { getId } from "../services/getId";
import { setResponse } from "../services/setResponse";
import data, { NotFoundError } from "../data/users";
import { validate } from "uuid";
import { handleError } from "../services/handleError";

export const getHandler: RequestListener = (req, resp) => {
  const id = getId(req.url);
  if (!id) {
    setResponse({
      code: 200,
      resp,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data.getUsers()),
    });
  } else if (!validate(id)) {
    handleError(400, "Invalid id...", resp);
  } else {
    try {
      const user = data.getUserById(id);
      setResponse({
        code: 200,
        resp,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(user),
      });
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
