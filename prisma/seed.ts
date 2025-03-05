import { prisma } from '../src/lib/prisma';
import { faker } from '@faker-js/faker';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.prod
config({ path: path.resolve(process.cwd(), '.env.prod') });

// Log the DATABASE_URL for debugging
console.log('Loaded DATABASE_URL:', process.env.DATABASE_URL);

async function main() {
  console.log('Clearing existing data...');
  // Clear existing data
  await prisma.session.deleteMany();
  await prisma.admission.deleteMany();
  await prisma.serviceUser.deleteMany();
  await prisma.ward.deleteMany();
  await prisma.activity.deleteMany();

  // Create Wards
  console.log('Creating wards...');
  const wardNames = ['Elm', 'Juniper', 'Mulberry', 'Palm'];
  const wards = await Promise.all(
    wardNames.map((name) =>
      prisma.ward.create({
        data: { name },
      }),
    ),
  );
  const wardIds = wards.map((ward) => ward.id);

  // Create Activities
  console.log('Creating activities...');
  const activityNames = [
    'Art Therapy',
    'Social Hub',
    'Cyber Cafe',
    'Gym',
    'Chat Cafe',
    'Community Visit',
    '1:1',
  ];
  const activities = await Promise.all(
    activityNames.map((name) =>
      prisma.activity.create({
        data: { name },
      }),
    ),
  );
  const activityIds = activities.map((activity) => activity.id);

  // Generate Unique NHS Numbers
  console.log('Generating NHS numbers...');
  const generateNHSNumber = (): string =>
    faker.number.int({ min: 1000000000, max: 9999999999 }).toString();

  const nhsNumbers = new Set<string>();
  while (nhsNumbers.size < 100) {
    nhsNumbers.add(generateNHSNumber());
  }
  const nhsNumberList = Array.from(nhsNumbers);

  // Create ServiceUsers and Admissions
  console.log('Creating service users and admissions...');
  const serviceUsers = [];
  const admissions = [];
  const now = new Date();
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(now.getFullYear() - 5);

  for (const nhsNumber of nhsNumberList) {
    const serviceUser = await prisma.serviceUser.create({
      data: {
        nhsNumber,
        name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      },
    });

    serviceUsers.push(serviceUser);

    // Determine if the service user has previous admissions
    const hasPreviousAdmissions = faker.datatype.boolean({ probability: 0.2 }); // 20% chance
    const admissionCount = hasPreviousAdmissions
      ? faker.number.int({ min: 2, max: 4 })
      : 1;

    for (let i = 0; i < admissionCount; i++) {
      const isCurrentAdmission = i === admissionCount - 1;
      const wardId = faker.helpers.arrayElement(wardIds);

      // Generate admissionDate and dischargeDate
      let admissionDate: Date;
      let dischargeDate: Date | null;

      if (isCurrentAdmission) {
        // Recent admission within the last 30 days
        admissionDate = faker.date.between({
          from: faker.date.past({ years: 1 }),
          to: now,
        });
        dischargeDate = null; // Currently admitted
      } else {
        // Previous admissions
        admissionDate = faker.date.between({
          from: fiveYearsAgo,
          to: now,
        });
        dischargeDate = faker.date.between({
          from: admissionDate,
          to: now,
        });
      }

      // Create Admission
      const admission = await prisma.admission.create({
        data: {
          serviceUserId: serviceUser.id,
          wardId,
          admissionDate,
          dischargeDate,
        },
      });

      admissions.push(admission);
    }
  }

  // Generate Sessions within Admissions
  console.log('Creating sessions...');
  const sessionsData = [];

  for (const admission of admissions) {
    const admissionStart = admission.admissionDate;
    const admissionEnd = admission.dischargeDate || now;

    // Determine number of sessions
    const numSessions = faker.number.int({ min: 5, max: 50 });

    for (let i = 0; i < numSessions; i++) {
      const sessionDate = faker.date.between({
        from: admissionStart,
        to: admissionEnd,
      });

      // Skip Sundays until two months ago
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(now.getMonth() - 2);
      if (
        sessionDate.getDay() === 0 && // Sunday
        sessionDate < twoMonthsAgo
      )
        continue;

      // Low activity on weekends
      if (sessionDate.getDay() === 6) {
        const participateOnSaturday = faker.datatype.boolean({
          probability: 0.3, // 30% chance to participate on Saturdays
        });
        if (!participateOnSaturday) continue;
      }

      // High activity between 8 AM and 7 PM
      const timeIn = new Date(sessionDate);
      timeIn.setHours(faker.number.int({ min: 8, max: 18 }));
      timeIn.setMinutes(faker.number.int({ min: 0, max: 59 }));
      timeIn.setSeconds(0);
      timeIn.setMilliseconds(0);

      const durationMinutes = faker.number.int({ min: 30, max: 210 }); // 30 mins to 3.5 hours
      const timeOut = new Date(timeIn.getTime() + durationMinutes * 60000);

      // Select a random activity
      const activityId = faker.helpers.arrayElement(activityIds);

      sessionsData.push({
        admissionId: admission.id,
        activityId,
        timeIn,
        timeOut,
      });
    }
  }

  // Batch insert sessions
  console.log('Inserting sessions in batches...');
  const batchSize = 1000;
  for (let i = 0; i < sessionsData.length; i += batchSize) {
    const batch = sessionsData.slice(i, i + batchSize);
    await prisma.session.createMany({ data: batch });
    console.log(`Inserted ${i + batch.length} sessions...`);
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
// prisma/seed.ts
