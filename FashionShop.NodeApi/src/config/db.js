const { PrismaClient } = require('@prisma/client');

// Tái sử dụng PrismaClient qua global để tránh tạo quá nhiều connection
const globalForPrisma = global;

if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
}

module.exports = globalForPrisma.prisma;
