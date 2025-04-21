// prisma/seed.ts
import { prisma } from '../src/lib/prisma';
import { faker } from '@faker-js/faker';
import { config } from 'dotenv';
import path from 'path';
import { supabaseAdmin } from '../src/lib/supabase';
import { SessionType, SessionStatus } from '@prisma/client';

config({ path: path.resolve(process.cwd(), '.env') });

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY must be defined for seeding');
}

const log = (message: string, data?: any) =>
  console.log(`[SEED] ${message}`, data ? JSON.stringify(data, null, 2) : '');

async function main() {
  log('Starting seed process...');

  const now = new Date();
  const fiveYearsAgo = new Date(
    now.getFullYear() - 5,
    now.getMonth(),
    now.getDate(),
  );

  // Clear existing data
  try {
    log('Clearing existing data...');
    await prisma.$transaction([
      prisma.declinedSession.deleteMany(), // Added for new model
      prisma.declineReason.deleteMany(), // Added for new model
      prisma.session.deleteMany(),
      prisma.activityContinuityLog.deleteMany(),
      prisma.admission.deleteMany(),
      prisma.serviceUser.deleteMany(),
      prisma.ward.deleteMany(),
      prisma.activity.deleteMany(),
      prisma.user.deleteMany(),
      prisma.role.deleteMany(),
      prisma.department.deleteMany(),
    ]);
    log('Prisma data cleared');
  } catch (error) {
    log('Error clearing Prisma data', error);
    throw new Error('Failed to clear existing data');
  }

  try {
    log('Clearing Supabase auth users...');
    const { data: users, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();
    if (listError)
      throw new Error(`Failed to list Supabase users: ${listError.message}`);
    if (users?.users.length > 0) {
      for (const user of users.users) {
        const { error: deleteError } =
          await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (deleteError)
          log(`Failed to delete user ${user.email}`, deleteError.message);
        else log(`Deleted user: ${user.email}`, { id: user.id });
      }
    }
    log('Supabase auth users cleared');
  } catch (error) {
    log('Error clearing Supabase auth users', error);
    throw new Error('Failed to clear Supabase auth users');
  }

  // Wards
  let wardIds: number[];
  try {
    const wardNames = ['Elm', 'Juniper', 'Mulberry', 'Palm', 'Oak', 'Willow'];
    const wards = await Promise.all(
      wardNames.map((name) => prisma.ward.create({ data: { name } })),
    );
    wardIds = wards.map((ward) => ward.id);
    log('Wards created', { count: wards.length });
  } catch (error) {
    log('Error creating wards', error);
    throw new Error('Failed to create wards');
  }

  // Departments
  let deptMap: Map<string, number>;
  try {
    await prisma.department.createMany({
      data: [
        { name: 'Psychology' },
        { name: 'Occupational Therapy' },
        { name: 'Activity Coordinator' },
        { name: 'Nursing' },
      ],
      skipDuplicates: true,
    });
    deptMap = new Map(
      (await prisma.department.findMany()).map((d) => [d.name, d.id]),
    );
    log('Departments seeded', { count: deptMap.size });
  } catch (error) {
    log('Error seeding departments', error);
    throw new Error('Failed to seed departments');
  }

  // Roles
  let roleMap: Map<string, number>;
  try {
    await prisma.role.createMany({
      data: [
        {
          name: 'Psychologist',
          level: 1,
          departmentId: deptMap.get('Psychology')!,
        },
        {
          name: 'Senior Psychologist',
          level: 2,
          departmentId: deptMap.get('Psychology')!,
        },
        {
          name: 'Site Lead',
          level: 3,
          departmentId: deptMap.get('Psychology')!,
        },
        {
          name: 'Director',
          level: 4,
          departmentId: deptMap.get('Psychology')!,
        },
        {
          name: 'Therapist',
          level: 1,
          departmentId: deptMap.get('Occupational Therapy')!,
        },
        {
          name: 'Senior Therapist',
          level: 2,
          departmentId: deptMap.get('Occupational Therapy')!,
        },
        {
          name: 'Site Lead',
          level: 3,
          departmentId: deptMap.get('Occupational Therapy')!,
        },
        {
          name: 'Director',
          level: 4,
          departmentId: deptMap.get('Occupational Therapy')!,
        },
        {
          name: 'Coordinator',
          level: 1,
          departmentId: deptMap.get('Activity Coordinator')!,
        },
        {
          name: 'Senior Coordinator',
          level: 2,
          departmentId: deptMap.get('Activity Coordinator')!,
        },
        {
          name: 'Site Lead',
          level: 3,
          departmentId: deptMap.get('Activity Coordinator')!,
        },
        {
          name: 'Director',
          level: 4,
          departmentId: deptMap.get('Activity Coordinator')!,
        },
        { name: 'Nurse', level: 1, departmentId: deptMap.get('Nursing')! },
        {
          name: 'Senior Nurse',
          level: 2,
          departmentId: deptMap.get('Nursing')!,
        },
        {
          name: 'Clinical Team Lead',
          level: 3,
          departmentId: deptMap.get('Nursing')!,
        },
        {
          name: 'Ward Manager',
          level: 4,
          departmentId: deptMap.get('Nursing')!,
        },
        {
          name: 'Clinical Service Manager',
          level: 5,
          departmentId: deptMap.get('Nursing')!,
        },
        {
          name: 'Super Admin',
          level: 10,
          departmentId: deptMap.get('Psychology')!,
        },
      ],
      skipDuplicates: true,
    });
    roleMap = new Map(
      (await prisma.role.findMany()).map((r) => [r.name, r.id]),
    );
    log('Roles seeded', { count: roleMap.size });
  } catch (error) {
    log('Error seeding roles', error);
    throw new Error('Failed to seed roles');
  }

  // Users
  let superAdminId: string | null = null;
  const level1to4Users: string[] = [];
  try {
    const exampleUsers = [
      {
        email: 'superadmin@example.com',
        role: 'Super Admin',
        dept: 'Psychology',
      },
      {
        email: 'director.psych1@example.com',
        role: 'Director',
        dept: 'Psychology',
      },
      {
        email: 'sitelead.psych1@example.com',
        role: 'Site Lead',
        dept: 'Psychology',
      },
      {
        email: 'senior.psych1@example.com',
        role: 'Senior Psychologist',
        dept: 'Psychology',
      },
      {
        email: 'psychologist1@example.com',
        role: 'Psychologist',
        dept: 'Psychology',
      },
      {
        email: 'psychologist2@example.com',
        role: 'Psychologist',
        dept: 'Psychology',
      },
      {
        email: 'director.ot1@example.com',
        role: 'Director',
        dept: 'Occupational Therapy',
      },
      {
        email: 'sitelead.ot1@example.com',
        role: 'Site Lead',
        dept: 'Occupational Therapy',
      },
      {
        email: 'senior.ot1@example.com',
        role: 'Senior Therapist',
        dept: 'Occupational Therapy',
      },
      {
        email: 'therapist1@example.com',
        role: 'Therapist',
        dept: 'Occupational Therapy',
      },
      {
        email: 'therapist2@example.com',
        role: 'Therapist',
        dept: 'Occupational Therapy',
      },
      {
        email: 'director.ac1@example.com',
        role: 'Director',
        dept: 'Activity Coordinator',
      },
      {
        email: 'sitelead.ac1@example.com',
        role: 'Site Lead',
        dept: 'Activity Coordinator',
      },
      {
        email: 'senior.ac1@example.com',
        role: 'Senior Coordinator',
        dept: 'Activity Coordinator',
      },
      {
        email: 'coordinator1@example.com',
        role: 'Coordinator',
        dept: 'Activity Coordinator',
      },
      {
        email: 'coordinator2@example.com',
        role: 'Coordinator',
        dept: 'Activity Coordinator',
      },
      {
        email: 'manager.nurse1@example.com',
        role: 'Ward Manager',
        dept: 'Nursing',
      },
      {
        email: 'senior.nurse1@example.com',
        role: 'Senior Nurse',
        dept: 'Nursing',
      },
      { email: 'nurse1@example.com', role: 'Nurse', dept: 'Nursing' },
      { email: 'nurse2@example.com', role: 'Nurse', dept: 'Nursing' },
    ];
    const password = 'defaultPassword123!';

    for (const user of exampleUsers) {
      const { data: authData, error } =
        await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password,
          email_confirm: true,
        });
      if (error)
        throw new Error(`Failed to create ${user.email}: ${error.message}`);

      const authId = authData.user.id;
      await prisma.user.create({
        data: {
          id: authId,
          email: user.email,
          name: faker.person.fullName(),
          departmentId: deptMap.get(user.dept)!,
          roleId: roleMap.get(user.role)!,
          createdById: user.role === 'Super Admin' ? null : authId,
        },
      });
      if (user.role === 'Super Admin') superAdminId = authId;
      if (
        [1, 2, 3, 4].includes(
          (await prisma.role.findUnique({
            where: { id: roleMap.get(user.role)! },
          }))!.level,
        )
      ) {
        level1to4Users.push(authId);
      }
    }
    if (!superAdminId) throw new Error('Super Admin not created');
    log('Users seeded', { count: exampleUsers.length });
  } catch (error) {
    log('Error seeding users', error);
    throw new Error('Failed to seed users');
  }

  // Decline Reasons
  let declineReasonMap: Map<string, number>;
  try {
    const declineReasons = [
      { name: 'Engaged in another activity' },
      { name: 'Unwell' },
      { name: 'Simply declined' },
    ];
    await prisma.declineReason.createMany({
      data: declineReasons,
      skipDuplicates: true,
    });
    declineReasonMap = new Map(
      (await prisma.declineReason.findMany()).map((r) => [r.name, r.id]),
    );
    log('Decline reasons seeded', { count: declineReasonMap.size });
  } catch (error) {
    log('Error seeding decline reasons', error);
    throw new Error('Failed to seed decline reasons');
  }

  // Activities with Continuity Logs
  let continuityLogs: any[];
  try {
    const activityData = [
      {
        name: 'Chat Cafe',
        description: 'A relaxed social gathering over tea',
        departmentId: null,
      },
      {
        name: 'My Coping Toolbox',
        description: 'Workshop on mental health strategies',
        departmentId: deptMap.get('Psychology'),
      },
      {
        name: 'Mindfulness',
        description: 'Guided meditation sessions',
        departmentId: null,
      },
      {
        name: 'Art Therapy',
        description: 'Creative expression for healing',
        departmentId: deptMap.get('Occupational Therapy'),
      },
      {
        name: 'Road to Recovery',
        description: 'Support group for rehabilitation',
        departmentId: deptMap.get('Psychology'),
      },
      {
        name: 'Comfort in the Community',
        description: 'Community integration activities',
        departmentId: null,
      },
      {
        name: 'Social Hub',
        description: 'Interactive social space',
        departmentId: null,
      },
      {
        name: 'Cyber Cafe',
        description: 'Digital skills and leisure',
        departmentId: deptMap.get('Activity Coordinator'),
      },
      {
        name: 'Gym',
        description: 'Physical fitness sessions',
        departmentId: null,
      },
      {
        name: 'Community Visit',
        description: 'Outings to local areas',
        departmentId: null,
      },
      {
        name: '1:1',
        description: 'Personalized support sessions',
        departmentId: deptMap.get('Nursing'),
      },
    ];

    for (const activity of activityData) {
      const createdActivity = await prisma.activity.create({ data: activity });
      const numCycles = faker.number.int({ min: 1, max: 4 });
      let currentDate = fiveYearsAgo;

      for (let i = 0; i < numCycles; i++) {
        const startDate = new Date(currentDate);
        const duration = faker.number.int({ min: 60, max: 300 });
        const isActive =
          i === numCycles - 1 && faker.datatype.boolean({ probability: 0.6 });
        const discontinueDate = isActive
          ? null
          : new Date(
              startDate.getTime() +
                faker.number.int({ min: 30, max: 365 }) * 24 * 60 * 60 * 1000,
            );

        await prisma.activityContinuityLog.create({
          data: {
            activityId: createdActivity.id,
            startDate,
            discontinuedDate: discontinueDate,
            reason: discontinueDate
              ? faker.helpers.arrayElement([
                  'Low attendance',
                  'Scheduling conflict',
                  'Staff shortage',
                ])
              : undefined,
            duration,
            createdById: faker.helpers.arrayElement(level1to4Users),
          },
        });
        currentDate = discontinueDate
          ? new Date(
              discontinueDate.getTime() +
                faker.number.int({ min: 7, max: 90 }) * 24 * 60 * 60 * 1000,
            )
          : now;
      }
    }
    continuityLogs = await prisma.activityContinuityLog.findMany();
    log('Activities and continuity logs created', {
      count: activityData.length,
      logs: continuityLogs.length,
    });
  } catch (error) {
    log('Error creating activities and continuity logs', error);
    throw new Error('Failed to create activities and continuity logs');
  }

  // Service Users and Admissions
  let admissions: any[];
  try {
    const nhsNumbers = Array.from({ length: 100 }, () =>
      faker.number.int({ min: 1000000000, max: 9999999999 }).toString(),
    );
    admissions = [];

    for (const nhsNumber of nhsNumbers) {
      const serviceUser = await prisma.serviceUser.create({
        data: {
          nhsNumber,
          name: `${faker.person.firstName()} ${faker.person.lastName()}`,
          createdById: superAdminId!,
        },
      });

      const admissionCount = faker.helpers.weightedArrayElement([
        { value: 1, weight: 40 },
        { value: 2, weight: 30 },
        { value: 3, weight: 20 },
        { value: 4, weight: 10 },
      ]);

      let lastDischargeDate: Date | null = null;
      for (let i = 0; i < admissionCount; i++) {
        const isActive =
          i === admissionCount - 1 &&
          faker.datatype.boolean({ probability: 0.3 });
        const admissionDate: Date = lastDischargeDate
          ? faker.date.between({ from: lastDischargeDate, to: now })
          : faker.date.between({ from: fiveYearsAgo, to: now });
        const dischargeDate: Date | null = isActive
          ? null
          : faker.date.between({ from: admissionDate, to: now });

        const admission = await prisma.admission.create({
          data: {
            serviceUserId: serviceUser.id,
            wardId: faker.helpers.arrayElement(wardIds),
            admittedById: faker.helpers.arrayElement(level1to4Users),
            dischargedById: dischargeDate
              ? faker.helpers.arrayElement(level1to4Users)
              : null,
            admissionDate,
            dischargeDate,
          },
        });
        admissions.push(admission);
        lastDischargeDate = dischargeDate;
      }
    }
    log('Service users and admissions created', {
      users: nhsNumbers.length,
      admissions: admissions.length,
    });
  } catch (error) {
    log('Error creating service users and admissions', error);
    throw new Error('Failed to create service users and admissions');
  }
  // Sessions with Group Clustering and Declined Sessions
  try {
    const groupSessions: {
      groupRef: string;
      facilitators: string[];
      admissions: number[];
    }[] = [];
    const totalGroupSessions = faker.number.int({ min: 10, max: 20 });

    for (let i = 0; i < totalGroupSessions; i++) {
      const groupRef = `GROUP-${faker.string.uuid()}`;
      const facilitators = faker.helpers.arrayElements(
        level1to4Users,
        faker.datatype.boolean() ? 1 : 2,
      );
      const participantCount =
        facilitators.length === 2
          ? faker.number.int({ min: 6, max: 12 })
          : faker.number.int({ min: 3, max: 6 });
      const participantAdmissions = faker.helpers.arrayElements(
        admissions,
        participantCount,
      );

      groupSessions.push({
        groupRef,
        facilitators,
        admissions: participantAdmissions.map((a) => a.id),
      });
    }

    for (const admission of admissions) {
      const hasEngaged = faker.datatype.boolean({ probability: 0.7 });
      if (!hasEngaged) continue;

      const numSessions = faker.number.int({ min: 1, max: 12 });
      const start = admission.admissionDate;
      const end = admission.dischargeDate || now;

      for (let i = 0; i < numSessions; i++) {
        const timeIn = faker.date.between({ from: start, to: end });
        const duration = faker.number.int({ min: 60, max: 300 }) * 60 * 1000;
        const timeOut = new Date(timeIn.getTime() + duration);

        const validLogs = continuityLogs.filter(
          (log) =>
            timeIn >= log.startDate &&
            (!log.discontinuedDate || timeIn <= log.discontinuedDate),
        );
        const activityLog =
          validLogs.length > 0
            ? faker.helpers.arrayElement(validLogs)
            : faker.helpers.arrayElement(continuityLogs);

        const isGroupSession = faker.datatype.boolean({ probability: 0.4 });
        let groupSessionData:
          | { groupRef: string; facilitators: string[] }
          | undefined;

        if (isGroupSession) {
          groupSessionData =
            groupSessions.find((g) => g.admissions.includes(admission.id)) ||
            faker.helpers.arrayElement(groupSessions);
        }

        const isDeclined = faker.datatype.boolean({ probability: 0.2 });
        const isCancelled = faker.datatype.boolean({ probability: 0.1 });
        const status = isDeclined
          ? SessionStatus.DECLINED
          : isCancelled
            ? SessionStatus.CANCELLED
            : timeOut < now
              ? SessionStatus.COMPLETED
              : SessionStatus.SCHEDULED;

        const session = await prisma.session.create({
          data: {
            type: isGroupSession ? SessionType.GROUP : SessionType.ONE_TO_ONE,
            status,
            facilitatedById: groupSessionData
              ? faker.helpers.arrayElement(groupSessionData.facilitators)
              : faker.helpers.arrayElement(level1to4Users),
            activityLogId: activityLog.id,
            admissionId: admission.id,
            groupRef: groupSessionData?.groupRef,
            groupDescription: groupSessionData
              ? `Group session with ${groupSessionData.facilitators.length} facilitators`
              : undefined,
            timeIn,
            timeOut: status === SessionStatus.COMPLETED ? timeOut : null,
            cancelReason:
              status === SessionStatus.CANCELLED
                ? faker.helpers.arrayElement([
                    'Staff unavailable',
                    'Scheduling issue',
                    'Other',
                  ])
                : undefined,
          },
        });

        if (status === SessionStatus.DECLINED) {
          await prisma.declinedSession.create({
            data: {
              sessionId: session.id,
              declineReasonId: faker.helpers.arrayElement(
                Array.from(declineReasonMap.values()),
              ),
              description: faker.datatype.boolean()
                ? faker.lorem.sentence()
                : null,
            },
          });
        }
      }
    }
    log('Sessions created with group clustering and declined sessions', {
      totalSessions: await prisma.session.count(),
      declinedSessions: await prisma.declinedSession.count(),
      cancelledSessions: await prisma.session.count({
        where: { status: SessionStatus.CANCELLED },
      }),
      groupSessions: totalGroupSessions,
    });
  } catch (error) {
    log('Error creating sessions', error);
    throw new Error('Failed to create sessions');
  }

  log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('[SEED ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    log('Prisma disconnected');
  });
// prisma/seed.ts
