import { type User, type InsertUser, UserRole } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private usernameIndex: Map<string, string>; // username -> id for O(1) lookups

  constructor() {
    this.users = new Map();
    this.usernameIndex = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // O(1) lookup using username index instead of O(n) linear search
    const id = this.usernameIndex.get(username);
    if (!id) return undefined;
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      role: UserRole.USER,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    this.usernameIndex.set(user.username, id);
    return user;
  }
}

export const storage = new MemStorage();
