import {
  type User,
  type InsertUser,
  UserRole,
  type UserRoleType,
  users,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "./database";
import bcrypt from "bcryptjs";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(id: string, role: UserRoleType): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<boolean>;
  verifyPassword(username: string, password: string): Promise<User | null>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      ...insertUser,
      password: hashedPassword,
      id,
      role: UserRole.USER,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserRole(
    id: string,
    role: UserRoleType,
  ): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, role };
    this.users.set(id, updated);
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async verifyPassword(
    username: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
}

// Database-backed storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await db.query.users.findFirst({
        where: eq(users.id, id),
      });
      return result;
    } catch (error) {
      console.error("Error fetching user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.query.users.findFirst({
        where: eq(users.username, username),
      });
      return result;
    } catch (error) {
      console.error("Error fetching user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        username: insertUser.username,
        password: hashedPassword,
        role: UserRole.USER,
      })
      .returning();

    return newUser;
  }

  async updateUserRole(
    id: string,
    role: UserRoleType,
  ): Promise<User | undefined> {
    try {
      const [updated] = await db
        .update(users)
        .set({ role })
        .where(eq(users.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating user role:", error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.query.users.findMany();
    } catch (error) {
      console.error("Error fetching all users:", error);
      return [];
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  async verifyPassword(
    username: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
}

// Use environment variable to choose storage backend
const USE_DATABASE = process.env.DATABASE_URL !== undefined;

export const storage: IStorage = USE_DATABASE
  ? new DatabaseStorage()
  : new MemStorage();

console.log(`Using ${USE_DATABASE ? "Database" : "Memory"} storage backend`);
