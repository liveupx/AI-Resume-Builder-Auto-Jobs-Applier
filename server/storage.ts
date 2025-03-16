import { users, type User, type InsertUser, type Resume, type Job, type Application, type TwitterJob } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Initial test accounts
const initialUsers: InsertUser[] = [
  {
    username: "testuser",
    password: "password123", // In real app, this would be hashed
    email: "user@example.com",
    role: "seeker",
    jobPreferences: {
      titles: ["Software Engineer", "Full Stack Developer"],
      locations: ["Remote", "New York"]
    }
  },
  {
    username: "agency1",
    password: "agency123",
    email: "agency@example.com",
    role: "agency",
    companyName: "Tech Recruiters Inc",
    companyLogo: "https://example.com/logo.png",
    companyDescription: "Leading tech recruitment agency"
  },
  {
    username: "admin",
    password: "admin123",
    email: "admin@example.com",
    role: "admin"
  }
];

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateStripeCustomerId(userId: number, customerId: string): Promise<User>;
  updateUserStripeInfo(userId: number, info: { stripeSubscriptionId: string | null; subscriptionTier: string }): Promise<User>;

  // Resume operations
  createResume(resume: any): Promise<Resume>;
  getResume(id: number): Promise<Resume | undefined>;
  getUserResumes(userId: number): Promise<Resume[]>;

  // Job operations
  createJob(job: any): Promise<Job>;
  getJob(id: number): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  updateJobApplicationCount(jobId: number): Promise<Job>;

  // Application operations
  createApplication(application: any): Promise<Application>;
  getApplication(id: number): Promise<Application | undefined>;
  getUserApplications(userId: number): Promise<Application[]>;
  markApplicationEmailSent(id: number): Promise<Application>;

  // Twitter job operations
  createTwitterJob(job: any): Promise<TwitterJob>;
  getTwitterJobByTweetId(tweetId: string): Promise<TwitterJob | undefined>;
  updateTwitterJob(id: number, updates: Partial<TwitterJob>): Promise<TwitterJob>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<number, Resume>;
  private jobs: Map<number, Job>;
  private applications: Map<number, Application>;
  private twitterJobs: Map<number, TwitterJob>;
  public sessionStore: session.SessionStore;

  private userId: number = 1;
  private resumeId: number = 1;
  private jobId: number = 1;
  private applicationId: number = 1;
  private twitterJobId: number = 1;

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.jobs = new Map();
    this.applications = new Map();
    this.twitterJobs = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Initialize test accounts
    initialUsers.forEach(user => {
      this.createUser(user);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = {
      ...insertUser,
      id,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionTier: "free",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    user.stripeCustomerId = customerId;
    this.users.set(userId, user);
    return user;
  }

  async updateUserStripeInfo(
    userId: number,
    info: { stripeSubscriptionId: string | null; subscriptionTier: string },
  ): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    Object.assign(user, info);
    this.users.set(userId, user);
    return user;
  }

  // Resume operations
  async createResume(resume: any): Promise<Resume> {
    const id = this.resumeId++;
    const newResume = { ...resume, id, createdAt: new Date() };
    this.resumes.set(id, newResume);
    return newResume;
  }

  async getResume(id: number): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  async getUserResumes(userId: number): Promise<Resume[]> {
    return Array.from(this.resumes.values()).filter(
      (resume) => resume.userId === userId,
    );
  }

  // Job operations
  async createJob(job: any): Promise<Job> {
    const id = this.jobId++;
    const newJob = { ...job, id, createdAt: new Date() };
    this.jobs.set(id, newJob);
    return newJob;
  }

  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }
  async updateJobApplicationCount(jobId: number): Promise<Job> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error("Job not found");
    job.applicationsCount = (job.applicationsCount || 0) + 1;
    this.jobs.set(jobId, job);
    return job;
  }

  // Application operations
  async createApplication(application: any): Promise<Application> {
    const id = this.applicationId++;
    const newApplication = { ...application, id, createdAt: new Date(), emailSent: false };
    this.applications.set(id, newApplication);
    return newApplication;
  }

  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async getUserApplications(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (application) => application.userId === userId,
    );
  }

  // Twitter job operations
  async createTwitterJob(job: any): Promise<TwitterJob> {
    const id = this.twitterJobId++;
    const newJob = { ...job, id, createdAt: new Date() };
    this.twitterJobs.set(id, newJob);
    return newJob;
  }

  async getTwitterJobByTweetId(tweetId: string): Promise<TwitterJob | undefined> {
    return Array.from(this.twitterJobs.values()).find(
      (job) => job.tweetId === tweetId
    );
  }

  async updateTwitterJob(id: number, updates: Partial<TwitterJob>): Promise<TwitterJob> {
    const job = this.twitterJobs.get(id);
    if (!job) throw new Error("Twitter job not found");
    const updatedJob = { ...job, ...updates };
    this.twitterJobs.set(id, updatedJob);
    return updatedJob;
  }

  // New methods for applications
  async markApplicationEmailSent(id: number): Promise<Application> {
    const application = this.applications.get(id);
    if (!application) throw new Error("Application not found");
    application.emailSent = true;
    this.applications.set(id, application);
    return application;
  }
}

export const storage = new MemStorage();