// Mock Prisma Client for build issues
export const prisma = {
  user: {
    findUnique: (args?: any) => Promise.resolve(null),
    findMany: (args?: any) => Promise.resolve([]),
    count: (args?: any) => Promise.resolve(0),
    create: (args?: any) => Promise.resolve({}),
    update: (args?: any) => Promise.resolve({}),
    delete: (args?: any) => Promise.resolve({}),
    aggregate: (args?: any) => Promise.resolve({ _sum: { amount: 0 } }),
    deleteMany: (args?: any) => Promise.resolve({ count: 0 }),
    groupBy: (args?: any) => Promise.resolve([]),
    updateMany: (args?: any) => Promise.resolve({ count: 0 })
  },
  payment: {
    findMany: (args?: any) => Promise.resolve([]),
    count: (args?: any) => Promise.resolve(0),
    aggregate: (args?: any) => Promise.resolve({ _sum: { amount: 0 } }),
    deleteMany: (args?: any) => Promise.resolve({ count: 0 })
  },
  reservation: {
    findMany: (args?: any) => Promise.resolve([]),
    count: (args?: any) => Promise.resolve(0),
    deleteMany: (args?: any) => Promise.resolve({ count: 0 })
  },
  emailLog: {
    findMany: (args?: any) => Promise.resolve([]),
    count: (args?: any) => Promise.resolve(0),
    findFirst: (args?: any) => Promise.resolve(null),
    create: (args?: any) => Promise.resolve({}),
    aggregate: (args?: any) => Promise.resolve({ _avg: { deliveryTime: 0, spamScore: 0 } }),
    updateMany: (args?: any) => Promise.resolve({ count: 0 }),
    deleteMany: (args?: any) => Promise.resolve({ count: 0 })
  },
  emailQueue: {
    findMany: (args?: any) => Promise.resolve([]),
    count: (args?: any) => Promise.resolve(0),
    create: (args?: any) => Promise.resolve({}),
    update: (args?: any) => Promise.resolve({}),
    delete: (args?: any) => Promise.resolve({}),
    deleteMany: (args?: any) => Promise.resolve({ count: 0 })
  },
  emailTemplate: {
    findMany: (args?: any) => Promise.resolve([]),
    count: (args?: any) => Promise.resolve(0),
    findFirst: (args?: any) => Promise.resolve(null),
    create: (args?: any) => Promise.resolve({}),
    update: (args?: any) => Promise.resolve({}),
    delete: (args?: any) => Promise.resolve({}),
    deleteMany: (args?: any) => Promise.resolve({ count: 0 })
  },
  passenger: {
    findMany: (args?: any) => Promise.resolve([]),
    count: (args?: any) => Promise.resolve(0),
    findFirst: (args?: any) => Promise.resolve(null),
    findUnique: (args?: any) => Promise.resolve(null),
    update: (args?: any) => Promise.resolve({ id: 'mock', firstName: 'Mock', lastName: 'User' }),
    delete: (args?: any) => Promise.resolve({}),
    deleteMany: (args?: any) => Promise.resolve({ count: 0 })
  },
  priceAlert: {
    findMany: (args?: any) => Promise.resolve([]),
    count: (args?: any) => Promise.resolve(0),
    deleteMany: (args?: any) => Promise.resolve({ count: 0 })
  },
  searchFavorite: {
    findMany: (args?: any) => Promise.resolve([]),
    count: (args?: any) => Promise.resolve(0),
    deleteMany: (args?: any) => Promise.resolve({ count: 0 })
  },
  campaign: {
    findMany: (args?: any) => Promise.resolve([]),
    count: (args?: any) => Promise.resolve(0),
    findUnique: (args?: any) => Promise.resolve(null),
    update: (args?: any) => Promise.resolve({ id: 'mock', clickCount: 1, viewCount: 1 }),
    create: (args?: any) => Promise.resolve({}),
    delete: (args?: any) => Promise.resolve({}),
    deleteMany: (args?: any) => Promise.resolve({ count: 0 })
  },
  surveyResponse: {
    findMany: (args?: any) => Promise.resolve([]),
    count: (args?: any) => Promise.resolve(0),
    deleteMany: (args?: any) => Promise.resolve({ count: 0 })
  },
  systemLog: {
    findMany: (args?: any) => Promise.resolve([]),
    count: (args?: any) => Promise.resolve(0),
    create: (args?: any) => Promise.resolve({}),
    deleteMany: (args?: any) => Promise.resolve({ count: 0 })
  },
  billingInfo: {
    findMany: (args?: any) => Promise.resolve([]),
    count: (args?: any) => Promise.resolve(0),
    updateMany: (args?: any) => Promise.resolve({ count: 0 }),
    create: (args?: any) => Promise.resolve({}),
    update: (args?: any) => Promise.resolve({}),
    delete: (args?: any) => Promise.resolve({})
  },
  emailSettings: {
    findFirst: (args?: any) => Promise.resolve(null),
    findMany: (args?: any) => Promise.resolve([]),
    create: (args?: any) => Promise.resolve({}),
    update: (args?: any) => Promise.resolve({}),
    delete: (args?: any) => Promise.resolve({}),
    deleteMany: (args?: any) => Promise.resolve({ count: 0 })
  },
  account: {
    findMany: (args?: any) => Promise.resolve([]),
    count: (args?: any) => Promise.resolve(0),
    deleteMany: (args?: any) => Promise.resolve({ count: 0 })
  },
  systemSettings: {
    findMany: (args?: any) => Promise.resolve([]),
    count: (args?: any) => Promise.resolve(0),
    deleteMany: (args?: any) => Promise.resolve({ count: 0 }),
    create: (args?: any) => Promise.resolve({})
  },
  seoSettings: {
    findFirst: (args?: any) => Promise.resolve(null),
    findMany: (args?: any) => Promise.resolve([]),
    create: (args?: any) => Promise.resolve({}),
    update: (args?: any) => Promise.resolve({}),
    delete: (args?: any) => Promise.resolve({})
  },
  session: {
    findMany: (args?: any) => Promise.resolve([]),
    count: (args?: any) => Promise.resolve(0),
    deleteMany: (args?: any) => Promise.resolve({ count: 0 })
  },
  $transaction: (fn: any) => fn({}),
  $disconnect: () => Promise.resolve()
}
