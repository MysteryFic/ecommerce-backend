import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { faker } from '@faker-js/faker';

const adapter = new PrismaMariaDb({
  host: 'localhost',
  port: 3308,
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'advisory_monitoring',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const programNames = [
    'BS Information Technology',
    'BS Computing Science',
    'BS Information Systems',
  ];
  const programs = await Promise.all(
    programNames.map((name) => prisma.program.create({ data: { name } })),
  );

  const studentsData = Array.from({ length: 10 }).map(() => ({
    name: faker.person.fullName(),
    programId: faker.helpers.arrayElement(programs).id,
  }));
  await prisma.student.createMany({ data: studentsData });
  console.log('Seeded 3 programs and 10 students');

  const adviserNames = [
    'Prof. Ana Reyes',
    'Prof. Mark Villanueva',
    'Prof. Liza Cortes',
  ];

  await Promise.all(
    programs.map((program, index) =>
      prisma.adviser.create({
        data: { 
          name: adviserNames[index] ?? faker.person.fullName(),
          programId: program.id,
        },
      }),
    ),
  );
  console.log(`Seeded ${programs.length} adviser(s)`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());