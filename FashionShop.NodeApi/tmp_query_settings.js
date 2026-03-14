require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const contactEmail = await prisma.setting.findUnique({
        where: { key: 'ContactEmail' }
    });
    console.log(`ContactEmail: ${contactEmail ? contactEmail.value : 'NOT FOUND'}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
