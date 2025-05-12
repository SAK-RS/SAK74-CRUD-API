import data, { NotFoundError } from "../data/users";
import { Worker } from "node:cluster";
import { User } from "../types";

export function msgHandler(worker: Worker, msg: unknown) {
  if (msg && typeof msg === "object" && "action" in msg) {
    switch (msg.action as Action) {
      case "getUsers":
        worker.send(data.getUsers());
        break;
      case "getUserById": {
        try {
          const user = data.getUserById((msg as Actions).id);
          worker.send(user);
        } catch (err) {
          worker.send({
            error: true,
            cause: err instanceof NotFoundError ? err.message : "Unknown error",
          });
        }
        break;
      }
      case "addUser": {
        try {
          const createdUser = data.addUser((msg as Actions).user);
          worker.send(createdUser);
        } catch (err) {
          worker.send({
            error: true,
            cause: "Unknown error",
          });
        }
        break;
      }
      case "updateUser": {
        try {
          const updatedUser = data.updateUser(
            (msg as Actions).id,
            (msg as Actions).user
          );
          worker.send(updatedUser);
        } catch (err) {
          worker.send({
            error: true,
            cause: err instanceof NotFoundError ? err.message : "Unknown error",
          });
        }
        break;
      }

      case "deleteUser": {
        try {
          data.deleteUser((msg as Actions).id);
          worker.send("Ok");
        } catch (err) {
          worker.send({
            error: true,
            cause: err instanceof NotFoundError ? err.message : "Unknown error",
          });
        }
        break;
      }
      default:
        throw Error("Unknown worker action");
    }
  } else {
    return;
  }
}

type Action = keyof typeof data;

type Actions = {
  action: Action;
  id: string;
  user: Omit<User, "id">;
};
