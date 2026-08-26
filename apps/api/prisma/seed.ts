import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'DemoP@ss123!';
const SYSTEM_OWNER_ID = '00000000-0000-0000-0000-000000000001';

const ROLES = [
  { name: 'guest', displayName: 'Guest', isSystem: true },
  { name: 'user', displayName: 'User', isSystem: true },
  { name: 'verified_user', displayName: 'Verified User', isSystem: true },
  { name: 'volunteer', displayName: 'Volunteer', isSystem: true },
  { name: 'organization', displayName: 'Organization', isSystem: true },
  { name: 'moderator', displayName: 'Moderator', isSystem: true },
  { name: 'administrator', displayName: 'Administrator', isSystem: true },
  { name: 'super_administrator', displayName: 'Super Administrator', isSystem: true },
];

const PERMISSIONS = [
  { code: 'user:read', resource: 'user', action: 'read' },
  { code: 'user:update:own', resource: 'user', action: 'update:own' },
  { code: 'post:create', resource: 'post', action: 'create' },
  { code: 'deed:submit', resource: 'deed', action: 'submit' },
  { code: 'deed:view', resource: 'deed', action: 'view' },
  { code: 'rays:view:own', resource: 'rays', action: 'view:own' },
  { code: 'rays:transfer', resource: 'rays', action: 'transfer' },
  { code: 'store:browse', resource: 'store', action: 'browse' },
  { code: 'store:purchase', resource: 'store', action: 'purchase' },
  { code: 'moderation:review', resource: 'moderation', action: 'review' },
  { code: 'admin:dashboard', resource: 'admin', action: 'dashboard' },
  { code: 'user:update:any', resource: 'user', action: 'update:any' },
  { code: 'admin:system', resource: 'admin', action: 'system' },
];

const USER_PERMS = [
  'user:read',
  'user:update:own',
  'post:create',
  'deed:submit',
  'deed:view',
  'rays:view:own',
  'rays:transfer',
  'store:browse',
  'store:purchase',
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  user: USER_PERMS,
  verified_user: USER_PERMS,
  volunteer: USER_PERMS,
  organization: USER_PERMS,
  moderator: [...USER_PERMS, 'moderation:review', 'admin:dashboard'],
  administrator: PERMISSIONS.map((p) => p.code).filter((c) => c !== 'admin:system'),
  super_administrator: PERMISSIONS.map((p) => p.code),
};

type SeedUser = {
  email: string;
  username: string;
  displayName: string;
  bio: string;
  city: string;
  role: string;
  level: number;
  xp: number;
};

const SEED_USERS: SeedUser[] = [
  {
    email: 'demo@luchi.app',
    username: 'demo_user',
    displayName: 'Анна Светлова',
    bio: 'Волонтёр, люблю парки, животных и тёплые дела по соседству.',
    city: 'Казань',
    role: 'verified_user',
    level: 7,
    xp: 1840,
  },
  {
    email: 'admin@luchi.app',
    username: 'admin',
    displayName: 'Администратор ЛУЧИ',
    bio: 'Слежу за честностью начислений и модерацией.',
    city: 'Москва',
    role: 'administrator',
    level: 12,
    xp: 9000,
  },
  {
    email: 'moderator@luchi.app',
    username: 'luchi_mod',
    displayName: 'Мария Модератор',
    bio: 'Проверяю добрые дела и помогаю новичкам.',
    city: 'Санкт-Петербург',
    role: 'moderator',
    level: 9,
    xp: 4100,
  },
  {
    email: 'ivan@luchi.app',
    username: 'ivan_green',
    displayName: 'Иван Зелёный',
    bio: 'Эко-волонтёр, субботники каждые выходные.',
    city: 'Казань',
    role: 'volunteer',
    level: 5,
    xp: 920,
  },
  {
    email: 'olga@luchi.app',
    username: 'olga_help',
    displayName: 'Ольга Добрая',
    bio: 'Помогаю пожилым соседям с покупками.',
    city: 'Казань',
    role: 'verified_user',
    level: 4,
    xp: 640,
  },
  {
    email: 'timur@luchi.app',
    username: 'timur_rays',
    displayName: 'Тимур Раев',
    bio: 'Организую донорские акции в университете.',
    city: 'Москва',
    role: 'verified_user',
    level: 6,
    xp: 1280,
  },
];

async function upsertRoles(): Promise<void> {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { displayName: role.displayName },
      create: role,
    });
  }
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }
  for (const [roleName, permCodes] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
    for (const code of permCodes) {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { code } });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }
}

async function ensureSystemAccount(): Promise<void> {
  await prisma.account.upsert({
    where: {
      ownerId_ownerType_accountType: {
        ownerId: SYSTEM_OWNER_ID,
        ownerType: 'SYSTEM',
        accountType: 'MAIN',
      },
    },
    update: {},
    create: {
      id: SYSTEM_OWNER_ID,
      ownerId: SYSTEM_OWNER_ID,
      ownerType: 'SYSTEM',
      accountType: 'MAIN',
    },
  });
}

async function upsertUsers(passwordHash: string): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const seed of SEED_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: seed.email } });
    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            displayName: seed.displayName,
            bio: seed.bio,
            city: seed.city,
            level: seed.level,
            experiencePoints: seed.xp,
            emailVerified: true,
            status: 'ACTIVE',
          },
        })
      : await prisma.user.create({
          data: {
            email: seed.email,
            username: seed.username,
            displayName: seed.displayName,
            bio: seed.bio,
            city: seed.city,
            level: seed.level,
            experiencePoints: seed.xp,
            emailVerified: true,
            passwordHash,
          },
        });

    ids.set(seed.username, user.id);
    await prisma.account.upsert({
      where: {
        ownerId_ownerType_accountType: {
          ownerId: user.id,
          ownerType: 'USER',
          accountType: 'MAIN',
        },
      },
      update: {},
      create: { ownerId: user.id, ownerType: 'USER', accountType: 'MAIN' },
    });

    const role = await prisma.role.findUniqueOrThrow({ where: { name: seed.role } });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });
  }
  return ids;
}

async function postEntry(params: {
  type: string;
  reason: string;
  initiatedBy: string;
  debitOwnerId: string;
  debitOwnerType: string;
  creditOwnerId: string;
  creditOwnerType: string;
  amount: number;
}): Promise<void> {
  const debit = await prisma.account.findUniqueOrThrow({
    where: {
      ownerId_ownerType_accountType: {
        ownerId: params.debitOwnerId,
        ownerType: params.debitOwnerType,
        accountType: 'MAIN',
      },
    },
  });
  const credit = await prisma.account.findUniqueOrThrow({
    where: {
      ownerId_ownerType_accountType: {
        ownerId: params.creditOwnerId,
        ownerType: params.creditOwnerType,
        accountType: 'MAIN',
      },
    },
  });
  const tx = await prisma.ledgerTransaction.create({
    data: {
      idempotencyKey: `seed-${params.type}-${params.creditOwnerId}-${params.reason}`.slice(0, 180),
      transactionType: params.type,
      status: 'POSTED',
      reason: params.reason,
      initiatedBy: params.initiatedBy,
      postedAt: new Date(),
    },
  });
  await prisma.ledgerEntry.createMany({
    data: [
      { transactionId: tx.id, accountId: debit.id, entryType: 'DEBIT', amount: params.amount },
      { transactionId: tx.id, accountId: credit.id, entryType: 'CREDIT', amount: params.amount },
    ],
  });
}

async function seedContent(userIds: Map<string, string>): Promise<void> {
  const demoId = userIds.get('demo_user');
  const adminId = userIds.get('admin');
  const ivanId = userIds.get('ivan_green');
  const olgaId = userIds.get('olga_help');
  const timurId = userIds.get('timur_rays');
  if (!demoId || !adminId || !ivanId || !olgaId || !timurId) {
    throw new Error('Seed users were not created');
  }

  const existingTx = await prisma.ledgerTransaction.count();
  if (existingTx === 0) {
    await postEntry({
      type: 'REWARD',
      reason: 'Приветственный бонус',
      initiatedBy: adminId,
      debitOwnerId: SYSTEM_OWNER_ID,
      debitOwnerType: 'SYSTEM',
      creditOwnerId: demoId,
      creditOwnerType: 'USER',
      amount: 250,
    });
    await postEntry({
      type: 'REWARD',
      reason: 'Субботник в парке Победы',
      initiatedBy: adminId,
      debitOwnerId: SYSTEM_OWNER_ID,
      debitOwnerType: 'SYSTEM',
      creditOwnerId: demoId,
      creditOwnerType: 'USER',
      amount: 80,
    });
    await postEntry({
      type: 'REWARD',
      reason: 'Помощь приюту',
      initiatedBy: adminId,
      debitOwnerId: SYSTEM_OWNER_ID,
      debitOwnerType: 'SYSTEM',
      creditOwnerId: ivanId,
      creditOwnerType: 'USER',
      amount: 120,
    });
    await postEntry({
      type: 'TRANSFER',
      reason: 'Спасибо за помощь с переездом',
      initiatedBy: ivanId,
      debitOwnerId: ivanId,
      debitOwnerType: 'USER',
      creditOwnerId: demoId,
      creditOwnerType: 'USER',
      amount: 15,
    });
    await postEntry({
      type: 'REWARD',
      reason: 'Донорская акция',
      initiatedBy: adminId,
      debitOwnerId: SYSTEM_OWNER_ID,
      debitOwnerType: 'SYSTEM',
      creditOwnerId: timurId,
      creditOwnerType: 'USER',
      amount: 200,
    });
  }

  const eco = await prisma.deedCategory.upsert({
    where: { slug: 'ecology' },
    update: {},
    create: {
      slug: 'ecology',
      name: 'Экология',
      icon: '🌿',
      color: '#6BCB77',
      baseRewardMin: 20,
      baseRewardMax: 80,
    },
  });
  const care = await prisma.deedCategory.upsert({
    where: { slug: 'care' },
    update: {},
    create: {
      slug: 'care',
      name: 'Забота о людях',
      icon: '💛',
      color: '#FFB800',
      baseRewardMin: 15,
      baseRewardMax: 60,
    },
  });
  const animals = await prisma.deedCategory.upsert({
    where: { slug: 'animals' },
    update: {},
    create: {
      slug: 'animals',
      name: 'Животные',
      icon: '🐾',
      color: '#4ECDC4',
      baseRewardMin: 25,
      baseRewardMax: 90,
    },
  });

  const org = await prisma.organization.upsert({
    where: { slug: 'green-kazan' },
    update: {},
    create: {
      name: 'Зелёная Казань',
      slug: 'green-kazan',
      description: 'Городские субботники и посадка деревьев',
      city: 'Казань',
      ownerUserId: ivanId,
    },
  });

  const tasks = [
    {
      title: 'Субботник в парке Горького',
      description: 'Собрать мусор, отсортировать вторсырьё, сделать фото отчёта.',
      categoryId: eco.id,
      rewardMin: 40,
      rewardMax: 70,
      city: 'Казань',
      maxParticipants: 12,
    },
    {
      title: 'Помочь соседу с покупками',
      description: 'Купить продукты пожилому соседу и донести до двери.',
      categoryId: care.id,
      rewardMin: 20,
      rewardMax: 40,
      city: 'Казань',
      maxParticipants: null,
    },
    {
      title: 'Выгулять собак из приюта',
      description: 'Час прогулки с собаками муниципального приюта.',
      categoryId: animals.id,
      rewardMin: 30,
      rewardMax: 55,
      city: 'Казань',
      maxParticipants: 6,
    },
    {
      title: 'Сдать кровь',
      description: 'Донорская акция в городском центре крови.',
      categoryId: care.id,
      rewardMin: 80,
      rewardMax: 120,
      city: 'Москва',
      maxParticipants: 20,
    },
  ];

  const taskIds: string[] = [];
  for (const task of tasks) {
    const existing = await prisma.deedTask.findFirst({ where: { title: task.title } });
    const saved =
      existing ??
      (await prisma.deedTask.create({
        data: {
          title: task.title,
          description: task.description,
          categoryId: task.categoryId,
          organizationId: org.id,
          rewardMin: task.rewardMin,
          rewardMax: task.rewardMax,
          locationCity: task.city,
          maxParticipants: task.maxParticipants,
          createdBy: adminId,
        },
      }));
    if (existing) {
      await prisma.deedTask.update({
        where: { id: existing.id },
        data: { maxParticipants: task.maxParticipants },
      });
    }
    taskIds.push(saved.id);
  }

  if ((await prisma.deedSubmission.count()) === 0) {
    await prisma.deedSubmission.create({
      data: {
        taskId: taskIds[0],
        userId: demoId,
        description: 'Собрала 9 пакетов, фото прилагаю. Было ветрено, но команда отличная!',
        status: 'APPROVED',
        rewardAmount: 40,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });
  }

  if ((await prisma.deedSubmission.count({ where: { status: 'PENDING' } })) === 0) {
    await prisma.deedSubmission.create({
      data: {
        taskId: taskIds[1],
        userId: demoId,
        description: 'Купила молоко, хлеб и лекарства тёте Нине из 12 квартиры.',
        status: 'PENDING',
      },
    });
    await prisma.deedSubmission.create({
      data: {
        taskId: taskIds[2],
        userId: olgaId,
        description: 'Выгуляла Рекса и Белку, 55 минут.',
        status: 'PENDING',
      },
    });
  }

  const pending = await prisma.deedSubmission.findMany({
    where: { status: 'PENDING' },
    include: { confirmations: true },
  });
  for (const submission of pending) {
    if (submission.confirmations.length > 0) {
      continue;
    }
    const beneficiaryId = submission.userId === demoId ? olgaId : demoId;
    await prisma.beneficiaryConfirmation.create({
      data: { submissionId: submission.id, beneficiaryUserId: beneficiaryId },
    });
  }

  const taskRows = await prisma.deedTask.findMany({ include: { submissions: true } });
  for (const task of taskRows) {
    const active = task.submissions.filter((row) => row.status !== 'REJECTED').length;
    await prisma.deedTask.update({
      where: { id: task.id },
      data: { currentParticipants: active },
    });
  }

  if ((await prisma.post.count()) === 0) {
    await prisma.post.create({
      data: {
        authorId: demoId,
        content: 'Сегодня закрыли субботник в парке Горького — ☀ уже на балансе. Присоединяйтесь на следующих выходных!',
        likesCount: 12,
        commentsCount: 2,
      },
    });
    await prisma.post.create({
      data: {
        authorId: ivanId,
        content: 'Посадили 30 саженцев у озера. Город становится зеленее — и это видно.',
        likesCount: 8,
        commentsCount: 1,
      },
    });
    await prisma.post.create({
      data: {
        authorId: olgaId,
        content: 'Маленькое дело: донесла сумки соседке. Иногда Лучи — это просто внимание.',
        likesCount: 15,
        commentsCount: 0,
      },
    });
    await prisma.post.create({
      data: {
        authorId: timurId,
        content: 'Донорская акция собрала 42 человека. Спасибо всем, кто пришёл после пар.',
        likesCount: 21,
        commentsCount: 1,
      },
    });
  }

  if ((await prisma.comment.count()) === 0) {
    const posts = await prisma.post.findMany({ orderBy: { createdAt: 'asc' } });
    if (posts[0]) {
      await prisma.comment.createMany({
        data: [
          { postId: posts[0].id, authorId: ivanId, content: 'Была там, отличная атмосфера!', likesCount: 3 },
          { postId: posts[0].id, authorId: olgaId, content: 'В следующее воскресенье тоже иду.', likesCount: 2 },
        ],
      });
    }
    if (posts[1]) {
      await prisma.comment.create({
        data: { postId: posts[1].id, authorId: demoId, content: 'Красиво! Нужно повторить у нас во дворе.', likesCount: 1 },
      });
    }
    if (posts[3]) {
      await prisma.comment.create({
        data: { postId: posts[3].id, authorId: olgaId, content: 'Горжусь вами. Сдать кровь — большое дело.', likesCount: 4 },
      });
    }
  }

  const products = [
    { name: 'Эко-сумка ЛУЧИ', description: 'Хлопковая сумка за добрые дела', imageEmoji: '👜', priceRays: 40, productType: 'PHYSICAL' },
    { name: 'Сертификат в кофейню', description: 'Чашка кофе у партнёра платформы', imageEmoji: '☕', priceRays: 60, productType: 'VOUCHER' },
    { name: 'Билет в музей', description: 'Разовый вход в партнёрский музей', imageEmoji: '🏛', priceRays: 90, productType: 'CERTIFICATE' },
    { name: 'Набор семян', description: 'Семена деревьев для двора или дачи', imageEmoji: '🌱', priceRays: 25, productType: 'PHYSICAL' },
    { name: 'Благодарность фонду', description: 'Перевод Лучей в благотворительный фонд', imageEmoji: '🎁', priceRays: 100, productType: 'DIGITAL' },
  ];
  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (!existing) {
      await prisma.product.create({ data: product });
    }
  }
}

async function main(): Promise<void> {
  const passwordHash = await argon2.hash(DEMO_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    hashLength: 32,
  });
  await upsertRoles();
  await ensureSystemAccount();
  const userIds = await upsertUsers(passwordHash);
  await seedContent(userIds);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    await prisma.$disconnect();
    throw error;
  });
