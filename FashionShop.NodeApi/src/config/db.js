const { PrismaClient } = require('@prisma/client');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const ws = require('ws');

// Bắt buộc khai báo WebSocket để Neon Adapter hoạt động trong Node.js
neonConfig.webSocketConstructor = ws;

// Tái sử dụng PrismaClient qua global để tránh tạo quá nhiều connection (Serverless Cold Start)
const globalForPrisma = global;

if (!globalForPrisma.prisma) {
    // Dùng biến môi trường Neon do Vercel tự tạo ra (có prefix Athea_)
    const connectionString = process.env.Athea_POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
}

module.exports = globalForPrisma.prisma;
