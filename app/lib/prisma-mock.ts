// Mock Prisma Client for build issues
export const prisma = {
  user: {
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    aggregate: () => Promise.resolve({ _sum: { amount: 0 } })
  },
  payment: {
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
    aggregate: () => Promise.resolve({ _sum: { amount: 0 } })
  },
  reservation: {
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0)
  },
  emailLog: {
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
    findFirst: () => Promise.resolve(null)
  },
  emailQueue: {
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0)
  },
  emailTemplate: {
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0)
  },
  passenger: {
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
    findFirst: () => Promise.resolve(null),
    update: () => Promise.resolve({}),
    deleteMany: () => Promise.resolve({ count: 0 })
  },
  priceAlert: {
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
    deleteMany: () => Promise.resolve({ count: 0 })
  },
  searchFavorite: {
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
    deleteMany: () => Promise.resolve({ count: 0 })
  },
  campaign: {
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0)
  },
  surveyResponse: {
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0)
  },
  systemLog: {
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0)
  },
  billingInfo: {
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0)
  },
  $transaction: (fn: any) => fn({}),
  $disconnect: () => Promise.resolve()
}
