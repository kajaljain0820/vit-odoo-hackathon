import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding roles...');
    
    const roles = [
        { id: 1, name: 'ADMIN' },
        { id: 2, name: 'MANAGER' },
        { id: 3, name: 'EMPLOYEE' }
    ];

    for (const role of roles) {
        await prisma.role.upsert({
            where: { id: role.id },
            update: {},
            create: role
        });
    }

    console.log('Roles seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
