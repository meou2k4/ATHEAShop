const { PrismaClient } = require('@prisma/client');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const ws = require('ws');

require('dotenv').config();

// Fix cho môi trường Node.js không có sẵn WebSocket (cần cho serverless)
neonConfig.webSocketConstructor = ws;

const globalForPrisma = global;

if (!globalForPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL;
    
    // Khởi tạo Pool serverless của Neon
    const pool = new Pool({ connectionString });
    
    // Gắn Adapter Neon vào Prisma
    const adapter = new PrismaNeon(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
}

module.exports = globalForPrisma.prisma;
