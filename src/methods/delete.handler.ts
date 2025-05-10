import { RequestListener } from "node:http";
import { getId } from "../services/getId";
import { validate } from "uuid";
import { handleError } from "../services/handleError";
import { setResponse } from "../services/setResponse";
import data, { NotFoundError } from "../data/users";

export const deleteHandler: RequestListener = (req, resp) => {
  const id = getId(req.url);
  if (!id || !validate(id)) {
    handleError(400, "Missed or invalid id...", resp);
    return;
  }
  try {
    data.deleteUser(id);
    setResponse({ code: 204, resp });
  } catch (err) {
    if (err instanceof NotFoundError) {
      handleError(404, err.message, resp);
    } else {
      throw err;
    }
  }
};
