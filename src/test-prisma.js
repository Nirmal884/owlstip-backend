import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("Prisma initialized");

await prisma.$connect();

console.log("Database connected");

await prisma.$disconnect();