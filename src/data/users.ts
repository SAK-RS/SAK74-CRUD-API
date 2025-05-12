import { randomUUID } from "node:crypto";
import { User } from "../types";

class Users {
  private users: User[] = [];
  getUsers() {
    return this.users;
  }
  getUserById(id: string) {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundError();
    }
    return user;
  }
  addUser(user: Omit<User, "id">) {
    const id = randomUUID();
    this.users.push({ ...user, id });
    return this.getUserById(id);
  }
  deleteUser(id: string) {
    const userIndex = this.userIndex(id);
    if (userIndex === -1) {
      throw new NotFoundError();
    }
    this.users.splice(userIndex, 1);
  }
  updateUser(id: string, user: Omit<User, "id">) {
    const userIndex = this.userIndex(id);
    if (userIndex === -1) {
      throw new NotFoundError();
    }
    this.users[userIndex] = { ...user, id: this.users[userIndex].id };
    return this.users[userIndex];
  }
  private userIndex(id: string) {
    return this.users.findIndex((user) => user.id === id);
  }
}

export default new Users();

export class NotFoundError extends Error {
  message = "User not found";
}
