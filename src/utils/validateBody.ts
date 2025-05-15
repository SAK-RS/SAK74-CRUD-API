import { User } from "../types";

export const validateBody = (body: Omit<User, "id">) => {
  const { username, age, hobbies } = body;
  if (
    !age ||
    !username ||
    !hobbies ||
    typeof age !== "number" ||
    typeof username !== "string" ||
    !Array.isArray(hobbies)
  ) {
    return false;
  }
  return true;
};
