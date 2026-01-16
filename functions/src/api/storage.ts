import { type User, type InsertUser, UserRole, type UserRoleType } from "../shared/schema";
import * as admin from "firebase-admin";
import bcrypt from "bcryptjs";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser, id?: string): Promise<User>;
  updateUserRole(id: string, role: UserRoleType): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<boolean>;
  verifyPassword(username: string, password: string): Promise<User | null>;
}

export class FirestoreStorage implements IStorage {
  private get db() {
    return admin.firestore();
  }
  
  private get usersCollection() {
    return this.db.collection("users");
  }

  async getUser(id: string): Promise<User | undefined> {
    const doc = await this.usersCollection.doc(id).get();
    if (!doc.exists) return undefined;
    const data = doc.data();
    return { id: doc.id, ...data } as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const snapshot = await this.usersCollection.where("username", "==", username).limit(1).get();
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  async createUser(insertUser: InsertUser, id?: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: Omit<User, 'id'> = {
      ...insertUser,
      password: hashedPassword,
      role: UserRole.USER,
      createdAt: new Date(),
    };
    
    // Check if user exists first to enforce unique username
    const existing = await this.getUserByUsername(insertUser.username);
    if (existing) {
        throw new Error("Username already exists");
    }

    if (id) {
      await this.usersCollection.doc(id).set(user);
      return { id, ...user } as User;
    } else {
      const docRef = await this.usersCollection.add(user);
      return { id: docRef.id, ...user } as User;
    }
  }

  async updateUserRole(id: string, role: UserRoleType): Promise<User | undefined> {
    const docRef = this.usersCollection.doc(id);
    await docRef.update({ role });
    return this.getUser(id);
  }

  async getAllUsers(): Promise<User[]> {
    const snapshot = await this.usersCollection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.usersCollection.doc(id).delete();
    return true;
  }

  async verifyPassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
}

export const storage = new FirestoreStorage();
