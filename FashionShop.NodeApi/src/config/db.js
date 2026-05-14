const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const globalForPrisma = global;

if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
}

module.exports = globalForPrisma.prisma;
