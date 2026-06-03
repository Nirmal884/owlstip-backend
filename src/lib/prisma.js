import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

// Ensure Environment Variables are loaded (critical for database connectivity)
dotenv.config();

// Create native PostgreSQL connection pool
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// Configure Prisma 7 PostgreSQL driver adapter
const adapter = new PrismaPg(pool);

// Instantiate PrismaClient with the driver adapter
const prisma = new PrismaClient({ adapter });

export default prisma;
