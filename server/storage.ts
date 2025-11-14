import { 
  users, 
  departments,
  targets,
  customers,
  progresses,
  type User, 
  type InsertUser,
  type Department,
  type InsertDepartment,
  type Target,
  type InsertTarget,
  type Customer,
  type InsertCustomer,
  type Progress,
  type InsertProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  listUsers(): Promise<User[]>;
  listUsersByRole(role: string): Promise<User[]>;
  listAMsByGM(gmId: number): Promise<User[]>;
  
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(dept: InsertDepartment): Promise<Department>;
  listDepartments(): Promise<Department[]>;
  
  createTarget(target: InsertTarget): Promise<Target>;
  getTargetsByUser(userId: number): Promise<Target[]>;
  getTargetByUserAndPeriod(userId: number, period: string): Promise<Target | undefined>;
  listTargets(): Promise<Target[]>;
  
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, data: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<void>;
  getCustomer(id: number): Promise<Customer | undefined>;
  listCustomersByAM(amId: number): Promise<Customer[]>;
  listCustomersByGM(gmId: number): Promise<Customer[]>;
  listAllCustomers(): Promise<Customer[]>;
  
  createProgress(progress: InsertProgress): Promise<Progress>;
  getProgressesByCustomer(customerId: number): Promise<Progress[]>;
  listProgressesByAM(amId: number): Promise<Progress[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async listUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role as any));
  }

  async listAMsByGM(gmId: number): Promise<User[]> {
    return await db.select().from(users).where(
      and(
        eq(users.role, "AM"),
        eq(users.gmId, gmId)
      )
    );
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const [dept] = await db.select().from(departments).where(eq(departments.id, id));
    return dept || undefined;
  }

  async createDepartment(insertDept: InsertDepartment): Promise<Department> {
    const [dept] = await db
      .insert(departments)
      .values(insertDept)
      .returning();
    return dept;
  }

  async listDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  async createTarget(insertTarget: InsertTarget): Promise<Target> {
    const [target] = await db
      .insert(targets)
      .values(insertTarget)
      .returning();
    return target;
  }

  async getTargetsByUser(userId: number): Promise<Target[]> {
    return await db.select().from(targets).where(eq(targets.userId, userId));
  }

  async getTargetByUserAndPeriod(userId: number, period: string): Promise<Target | undefined> {
    const [target] = await db.select().from(targets).where(
      and(
        eq(targets.userId, userId),
        eq(targets.period, period)
      )
    );
    return target || undefined;
  }

  async listTargets(): Promise<Target[]> {
    return await db.select().from(targets).orderBy(desc(targets.period));
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async updateCustomer(id: number, data: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await db
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return customer || undefined;
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async listCustomersByAM(amId: number): Promise<Customer[]> {
    return await db.select().from(customers).where(eq(customers.amId, amId));
  }

  async listCustomersByGM(gmId: number): Promise<Customer[]> {
    const ams = await this.listAMsByGM(gmId);
    const amIds = ams.map(am => am.id);
    
    if (amIds.length === 0) return [];
    
    return await db.select().from(customers).where(
      sql`${customers.amId} = ANY(${amIds})`
    );
  }

  async listAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async createProgress(insertProgress: InsertProgress): Promise<Progress> {
    const [progress] = await db
      .insert(progresses)
      .values(insertProgress)
      .returning();
    
    await db
      .update(customers)
      .set({ 
        status: insertProgress.status,
        updatedAt: new Date()
      })
      .where(eq(customers.id, insertProgress.customerId));
    
    return progress;
  }

  async getProgressesByCustomer(customerId: number): Promise<Progress[]> {
    return await db.select().from(progresses)
      .where(eq(progresses.customerId, customerId))
      .orderBy(desc(progresses.date));
  }

  async listProgressesByAM(amId: number): Promise<Progress[]> {
    return await db.select().from(progresses)
      .where(eq(progresses.amId, amId))
      .orderBy(desc(progresses.date));
  }
}

export const storage = new DatabaseStorage();
