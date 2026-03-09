const { PrismaClient } = require('@prisma/client');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const ws = require('ws');

// Cấu hình Neon để sử dụng WebSockets (bắt buộc cho môi trường Node.js)
neonConfig.webSocketConstructor = ws;

const globalForPrisma = global;

if (!globalForPrisma.prisma) {
    // Thử lấy chuỗi kết nối từ nhiều nguồn khác nhau (cho Vercel/Neon)
    const connectionString = 
        process.env.DATABASE_URL || 
        process.env.Athea_POSTGRES_URL || 
        process.env.Athea_DATABASE_URL ||
        process.env.POSTGRES_URL;

    if (!connectionString) {
        console.error('CRITICAL ERROR: No database connection string found in environment variables!');
        console.error('Expected one of: DATABASE_URL, Athea_POSTGRES_URL, Athea_DATABASE_URL, POSTGRES_URL');
        throw new Error('Database connection string is missing.');
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    
    globalForPrisma.prisma = new PrismaClient({ adapter });
}

module.exports = globalForPrisma.prisma;
