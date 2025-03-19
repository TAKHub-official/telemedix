// This file provides a singleton instance of the Prisma client
// to be used throughout the application

const { PrismaClient } = require('@prisma/client');

// Create a global instance of PrismaClient
// This ensures we don't exhaust database connections during development
const prisma = global.prisma || new PrismaClient();

// Save prisma to the global object in development to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

// Log all queries in development mode
if (process.env.NODE_ENV === 'development') {
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
    return result;
  });
}

module.exports = prisma; 