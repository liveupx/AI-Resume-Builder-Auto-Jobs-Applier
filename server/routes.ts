import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { stripe, createSubscription, cancelSubscription } from "./stripe";
import { sendEmail, sendApplicationNotification } from "./sendgrid";
import { summarizeResume } from "./grok";
import { insertJobSchema, insertResumeSchema, insertApplicationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Resume routes
  app.post("/api/resumes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const parsed = insertResumeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }

    const resume = await storage.createResume({
      ...parsed.data,
      userId: req.user.id,
    });

    res.status(201).json(resume);
  });

  app.get("/api/resumes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const resumes = await storage.getUserResumes(req.user.id);
    res.json(resumes);
  });

  // Job routes
  app.post("/api/jobs", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "agency") {
      return res.sendStatus(401);
    }

    const parsed = insertJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }

    const job = await storage.createJob({
      ...parsed.data,
      userId: req.user.id,
    });

    res.status(201).json(job);
  });

  app.get("/api/jobs", async (req, res) => {
    const jobs = await storage.getAllJobs();
    res.json(jobs);
  });

  // Job matching route
  app.get("/api/jobs/matching", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const user = await storage.getUser(req.user.id);
    if (!user?.jobPreferences) {
      return res.status(400).json({ error: "No job preferences set" });
    }

    const allJobs = await storage.getAllJobs();
    const matchingJobs = allJobs.filter(job => {
      const prefs = user.jobPreferences as any;
      return (
        job.status === "active" &&
        (!prefs.titles || prefs.titles.some((t: string) =>
          job.title.toLowerCase().includes(t.toLowerCase()))) &&
        (!prefs.locations || prefs.locations.includes(job.location))
      );
    });

    res.json(matchingJobs);
  });

  // Auto-application route
  app.post("/api/auto-apply", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { resumeId } = req.body;
    if (!resumeId) {
      return res.status(400).json({ error: "Resume ID is required" });
    }

    const resume = await storage.getResume(resumeId);
    if (!resume || resume.userId !== req.user.id) {
      return res.status(400).json({ error: "Invalid resume" });
    }

    const user = await storage.getUser(req.user.id);
    if (!user?.jobPreferences) {
      return res.status(400).json({ error: "No job preferences set" });
    }

    const matchingJobs = await storage.getAllJobs();
    const applications = [];

    for (const job of matchingJobs) {
      if (job.status !== "active") continue;

      try {
        // Create application
        const application = await storage.createApplication({
          userId: req.user.id,
          jobId: job.id,
          resumeId,
        });

        // Update job application count
        await storage.updateJobApplicationCount(job.id);

        // Send notification email
        const employer = await storage.getUser(job.userId);
        if (employer) {
          await sendApplicationNotification(
            employer.email,
            job.title,
            user.username
          );
          await storage.markApplicationEmailSent(application.id);
        }

        applications.push(application);
      } catch (error) {
        console.error(`Failed to apply for job ${job.id}:`, error);
      }
    }

    res.json({ applications });
  });

  // Application routes
  app.post("/api/applications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const parsed = insertApplicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }

    const application = await storage.createApplication({
      ...parsed.data,
      userId: req.user.id,
    });

    const job = await storage.getJob(parsed.data.jobId);
    if (!job) {
      return res.status(400).json({ error: "Job not found" });
    }

    await storage.updateJobApplicationCount(job.id);

    const employer = await storage.getUser(job.userId);
    if (employer) {
      await sendApplicationNotification(
        employer.email,
        job.title,
        req.user.username
      );
      await storage.markApplicationEmailSent(application.id);
    }

    res.status(201).json(application);
  });

  // Subscription routes
  app.post("/api/subscribe", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { tier } = req.body;
      const subscription = await createSubscription(req.user.id, tier);
      res.json(subscription);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/cancel-subscription", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      await cancelSubscription(req.user.id);
      res.sendStatus(200);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });


  // Market Insights routes
  app.get("/api/insights/salary-trends", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const jobs = await storage.getAllJobs();

    // Calculate salary trends by role
    const salaryTrends = jobs.reduce((acc: any[], job) => {
      if (!job.salary) return acc;

      const role = job.title.split(" ")[0]; // Simplistic role extraction
      const existingRole = acc.find(r => r.role === role);

      const salary = parseInt(job.salary.replace(/[^0-9]/g, ""));
      if (isNaN(salary)) return acc;

      if (existingRole) {
        existingRole.count++;
        existingRole.totalSalary += salary;
        existingRole.avgSalary = Math.round(existingRole.totalSalary / existingRole.count);
      } else {
        acc.push({
          role,
          count: 1,
          totalSalary: salary,
          avgSalary: salary
        });
      }

      return acc;
    }, []);

    res.json(salaryTrends);
  });

  app.get("/api/insights/location-trends", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const jobs = await storage.getAllJobs();

    // Calculate trends by location
    const locationTrends = jobs.reduce((acc: any[], job) => {
      const existingLocation = acc.find(l => l.location === job.location);

      if (existingLocation) {
        existingLocation.count++;
      } else {
        acc.push({
          location: job.location,
          count: 1
        });
      }

      return acc;
    }, []);

    // Sort by count and take top 10
    const topLocations = locationTrends
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json(topLocations);
  });

  app.get("/api/insights/skill-trends", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const jobs = await storage.getAllJobs();

    // Extract skills from requirements and calculate trends
    const skillTrends = jobs.reduce((acc: any[], job) => {
      const skills = job.requirements
        .toLowerCase()
        .match(/\b(?:javascript|python|react|node|sql|aws|docker)\b/g) || [];

      skills.forEach(skill => {
        const existingSkill = acc.find(s => s.skill === skill);

        if (existingSkill) {
          existingSkill.count++;
        } else {
          acc.push({
            skill,
            count: 1
          });
        }
      });

      return acc;
    }, []);

    // Sort by count and take top 10
    const topSkills = skillTrends
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json(topSkills);
  });

  app.get("/api/insights/recent-jobs", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const jobs = await storage.getAllJobs();

    // Get recent jobs from both direct postings and Twitter
    const recentJobs = jobs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    res.json(recentJobs);
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(401);
    }

    const users = Array.from(storage.users.values());
    res.json(users);
  });

  app.get("/api/admin/applications", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(401);
    }

    const applications = await storage.getAllApplications();
    res.json(applications);
  });

  const httpServer = createServer(app);
  return httpServer;
}