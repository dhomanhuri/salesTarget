import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { upload } from "./upload";
import bcrypt from "bcrypt";
import session from "express-session";
import type { User, CustomerStatus } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const SALT_ROUNDS = 10;

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  const requireAuth = async (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.get("/api/users", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      let users;
      if (currentUser.role === "ADMIN") {
        users = await storage.listUsers();
      } else if (currentUser.role === "GM") {
        users = await storage.listAMsByGM(currentUser.id);
      } else {
        return res.status(403).json({ error: "Forbidden" });
      }

      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Failed to list users" });
    }
  });

  app.get("/api/users/gms", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "ADMIN") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const gms = await storage.listUsersByRole("GM");
      const gmsWithoutPasswords = gms.map(({ password, ...user }) => user);
      res.json(gmsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Failed to list GMs" });
    }
  });

  app.get("/api/users/ams", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      let ams;
      if (currentUser.role === "ADMIN") {
        ams = await storage.listUsersByRole("AM");
      } else if (currentUser.role === "GM") {
        ams = await storage.listAMsByGM(currentUser.id);
      } else {
        return res.status(403).json({ error: "Forbidden" });
      }

      const amsWithoutPasswords = ams.map(({ password, ...user }) => user);
      res.json(amsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Failed to list AMs" });
    }
  });

  app.post("/api/users", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "GM")) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { name, email, password, role, departmentId, gmId } = req.body;
      
      if (currentUser.role === "GM" && role !== "AM") {
        return res.status(403).json({ error: "GMs can only create AM users" });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role,
        departmentId: departmentId || null,
        gmId: role === "AM" ? (gmId || currentUser.id) : null,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.delete("/api/users/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "GM")) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const userId = parseInt(req.params.id);
      if (userId === currentUser.id) {
        return res.status(400).json({ error: "Cannot delete yourself" });
      }

      await storage.deleteUser(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.get("/api/departments", requireAuth, async (req: Request, res: Response) => {
    try {
      const departments = await storage.listDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: "Failed to list departments" });
    }
  });

  app.post("/api/departments", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "ADMIN") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { name } = req.body;
      const department = await storage.createDepartment({ name });
      res.json(department);
    } catch (error) {
      res.status(500).json({ error: "Failed to create department" });
    }
  });

  app.get("/api/targets", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      let targets;
      if (currentUser.role === "ADMIN") {
        targets = await storage.listTargets();
      } else if (currentUser.role === "GM") {
        const ams = await storage.listAMsByGM(currentUser.id);
        const allTargets = await storage.listTargets();
        const amIds = ams.map(am => am.id);
        targets = allTargets.filter(t => amIds.includes(t.userId));
      } else {
        targets = await storage.getTargetsByUser(currentUser.id);
      }

      const allUsers = await storage.listUsers();
      const targetsWithNames = targets.map(target => ({
        ...target,
        userName: allUsers.find(u => u.id === target.userId)?.name || "Unknown",
      }));

      res.json(targetsWithNames);
    } catch (error) {
      res.status(500).json({ error: "Failed to list targets" });
    }
  });

  app.post("/api/targets", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "GM")) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { userId, period, amountRp } = req.body;

      if (currentUser.role === "GM") {
        const am = await storage.getUser(userId);
        if (!am || am.gmId !== currentUser.id) {
          return res.status(403).json({ error: "Can only set targets for your AMs" });
        }
      }

      const target = await storage.createTarget({
        userId,
        period,
        amountRp: amountRp.toString(),
      });

      res.json(target);
    } catch (error) {
      console.error("Create target error:", error);
      res.status(500).json({ error: "Failed to create target" });
    }
  });

  app.get("/api/customers", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      let customers;
      if (currentUser.role === "ADMIN") {
        customers = await storage.listAllCustomers();
      } else if (currentUser.role === "GM") {
        customers = await storage.listCustomersByGM(currentUser.id);
      } else {
        customers = await storage.listCustomersByAM(currentUser.id);
      }

      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to list customers" });
    }
  });

  app.post("/api/customers", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "AM") {
        return res.status(403).json({ error: "Only AMs can create customers" });
      }

      const { companyName, pic, contact, potentialRp, estCloseDate, status } = req.body;

      const customer = await storage.createCustomer({
        amId: currentUser.id,
        companyName,
        pic,
        contact,
        potentialRp: potentialRp.toString(),
        estCloseDate: estCloseDate || null,
        status: status || "Prospect",
      });

      res.json(customer);
    } catch (error) {
      console.error("Create customer error:", error);
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "AM") {
        return res.status(403).json({ error: "Only AMs can update customers" });
      }

      const customerId = parseInt(req.params.id);
      const existingCustomer = await storage.getCustomer(customerId);
      
      if (!existingCustomer || existingCustomer.amId !== currentUser.id) {
        return res.status(403).json({ error: "Can only update your own customers" });
      }

      const { companyName, pic, contact, potentialRp, estCloseDate, status } = req.body;

      const customer = await storage.updateCustomer(customerId, {
        companyName,
        pic,
        contact,
        potentialRp: potentialRp.toString(),
        estCloseDate: estCloseDate || null,
        status,
      });

      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "AM") {
        return res.status(403).json({ error: "Only AMs can delete customers" });
      }

      const customerId = parseInt(req.params.id);
      const existingCustomer = await storage.getCustomer(customerId);
      
      if (!existingCustomer || existingCustomer.amId !== currentUser.id) {
        return res.status(403).json({ error: "Can only delete your own customers" });
      }

      await storage.deleteCustomer(customerId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer" });
    }
  });

  app.get("/api/customers/:id/progresses", requireAuth, async (req: Request, res: Response) => {
    try {
      const customerId = parseInt(req.params.id);
      const progresses = await storage.getProgressesByCustomer(customerId);
      res.json(progresses);
    } catch (error) {
      res.status(500).json({ error: "Failed to list progresses" });
    }
  });

  app.post("/api/upload", requireAuth, upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ fileUrl });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  app.post("/api/customers/:id/progresses", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "AM") {
        return res.status(403).json({ error: "Only AMs can log progress" });
      }

      const customerId = parseInt(req.params.id);
      const customer = await storage.getCustomer(customerId);
      
      if (!customer || customer.amId !== currentUser.id) {
        return res.status(403).json({ error: "Can only log progress for your own customers" });
      }

      const { date, note, status, fileUrl } = req.body;

      const progress = await storage.createProgress({
        customerId,
        amId: currentUser.id,
        date,
        note,
        status,
        fileUrl: fileUrl || null,
      });

      res.json(progress);
    } catch (error) {
      console.error("Create progress error:", error);
      res.status(500).json({ error: "Failed to create progress" });
    }
  });

  app.put("/api/users/:id/password", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const targetUserId = parseInt(req.params.id);
      const targetUser = await storage.getUser(targetUserId);
      
      if (!targetUser) {
        return res.status(404).json({ error: "Target user not found" });
      }

      // Permission check
      const canResetPassword = 
        currentUser.role === "ADMIN" || // Admin can reset all passwords
        (currentUser.role === "GM" && targetUser.role === "AM" && targetUser.gmId === currentUser.id) || // GM can reset their AMs
        (currentUser.id === targetUserId); // Users can reset their own password

      if (!canResetPassword) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { newPassword, currentPassword } = req.body;

      // If user is resetting their own password, verify current password
      if (currentUser.id === targetUserId) {
        const validPassword = await bcrypt.compare(currentPassword || "", currentUser.password);
        if (!validPassword) {
          return res.status(401).json({ error: "Current password is incorrect" });
        }
      }

      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await storage.updateUser(targetUserId, { password: hashedPassword });

      res.json({ success: true });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  app.get("/api/dashboard/admin", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "ADMIN") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const allTargets = await storage.listTargets();
      const allCustomers = await storage.listAllCustomers();
      const allUsers = await storage.listUsers();
      const ams = allUsers.filter(u => u.role === "AM");

      const totalTarget = allTargets.reduce((sum, t) => sum + parseFloat(t.amountRp.toString()), 0);
      const totalActual = allCustomers
        .filter(c => c.status === "Closed Won")
        .reduce((sum, c) => sum + parseFloat(c.potentialRp.toString()), 0);

      const amPerformance = ams.map(am => {
        const targets = allTargets.filter(t => t.userId === am.id);
        const target = targets.reduce((sum, t) => sum + parseFloat(t.amountRp.toString()), 0);
        const customers = allCustomers.filter(c => c.amId === am.id && c.status === "Closed Won");
        const actual = customers.reduce((sum, c) => sum + parseFloat(c.potentialRp.toString()), 0);

        return {
          name: am.name,
          target,
          actual,
        };
      });

      res.json({
        totalTarget,
        totalActual,
        totalAMs: ams.length,
        achievementRate: totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0,
        amPerformance,
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);
      res.status(500).json({ error: "Failed to get dashboard data" });
    }
  });

  app.get("/api/dashboard/gm/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "GM") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const ams = await storage.listAMsByGM(currentUser.id);
      const allTargets = await storage.listTargets();
      const allCustomers = await storage.listCustomersByGM(currentUser.id);

      const amIds = ams.map(am => am.id);
      const targets = allTargets.filter(t => amIds.includes(t.userId));

      const totalTarget = targets.reduce((sum, t) => sum + parseFloat(t.amountRp.toString()), 0);
      const totalActual = allCustomers
        .filter(c => c.status === "Closed Won")
        .reduce((sum, c) => sum + parseFloat(c.potentialRp.toString()), 0);

      const amPerformance = ams.map(am => {
        const amTargets = targets.filter(t => t.userId === am.id);
        const target = amTargets.reduce((sum, t) => sum + parseFloat(t.amountRp.toString()), 0);
        const customers = allCustomers.filter(c => c.amId === am.id && c.status === "Closed Won");
        const actual = customers.reduce((sum, c) => sum + parseFloat(c.potentialRp.toString()), 0);

        return {
          name: am.name,
          target,
          actual,
        };
      });

      res.json({
        totalTarget,
        totalActual,
        totalAMs: ams.length,
        amPerformance,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get dashboard data" });
    }
  });

  app.get("/api/dashboard/am/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "AM") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const targets = await storage.getTargetsByUser(currentUser.id);
      const customers = await storage.listCustomersByAM(currentUser.id);

      const myTarget = targets.reduce((sum, t) => sum + parseFloat(t.amountRp.toString()), 0);
      const totalPotential = customers
        .filter(c => c.status !== "Closed Lost")
        .reduce((sum, c) => sum + parseFloat(c.potentialRp.toString()), 0);

      const statusBreakdown: { status: CustomerStatus; count: number }[] = [
        { status: "Prospect", count: 0 },
        { status: "On Going", count: 0 },
        { status: "Negotiation", count: 0 },
        { status: "Closed Won", count: 0 },
        { status: "Closed Lost", count: 0 },
      ];

      customers.forEach(c => {
        const item = statusBreakdown.find(s => s.status === c.status);
        if (item) item.count++;
      });

      res.json({
        myTarget,
        totalPotential,
        totalCustomers: customers.length,
        statusBreakdown,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get dashboard data" });
    }
  });

  app.get("/api/reports", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const period = req.query.period as string || new Date().toISOString().slice(0, 7);

      let ams;
      if (currentUser.role === "ADMIN") {
        ams = await storage.listUsersByRole("AM");
      } else if (currentUser.role === "GM") {
        ams = await storage.listAMsByGM(currentUser.id);
      } else {
        ams = [currentUser];
      }

      const allTargets = await storage.listTargets();
      const periodTargets = allTargets.filter(t => t.period === period);

      const reportData = await Promise.all(ams.map(async am => {
        const amTargets = periodTargets.filter(t => t.userId === am.id);
        const target = amTargets.reduce((sum, t) => sum + parseFloat(t.amountRp.toString()), 0);

        const customers = await storage.listCustomersByAM(am.id);
        const actual = customers
          .filter(c => c.status === "Closed Won")
          .reduce((sum, c) => sum + parseFloat(c.potentialRp.toString()), 0);

        return {
          amName: am.name,
          target,
          actual,
          achievementRate: target > 0 ? (actual / target) * 100 : 0,
          totalCustomers: customers.length,
        };
      }));

      res.json(reportData);
    } catch (error) {
      console.error("Reports error:", error);
      res.status(500).json({ error: "Failed to generate reports" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
