
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  detectRuntime,
} = require('@prisma/client/runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.10.2
 * Query Engine version: 5a9203d0590c951969e85a7d07215503f4672eb9
 */
Prisma.prismaVersion = {
  client: "5.10.2",
  engine: "5a9203d0590c951969e85a7d07215503f4672eb9"
}

Prisma.PrismaClientKnownRequestError = () => {
  throw new Error(`PrismaClientKnownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  throw new Error(`PrismaClientUnknownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  throw new Error(`PrismaClientRustPanicError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  throw new Error(`PrismaClientInitializationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  throw new Error(`PrismaClientValidationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  throw new Error(`NotFoundError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  throw new Error(`sqltag is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  throw new Error(`empty is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  throw new Error(`join is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  throw new Error(`raw is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  throw new Error(`Extensions.getExtensionContext is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  throw new Error(`Extensions.defineExtension is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  password: 'password',
  countryCode: 'countryCode',
  phone: 'phone',
  birthDay: 'birthDay',
  birthMonth: 'birthMonth',
  birthYear: 'birthYear',
  gender: 'gender',
  identityNumber: 'identityNumber',
  address: 'address',
  city: 'city',
  isForeigner: 'isForeigner',
  emailVerified: 'emailVerified',
  image: 'image',
  resetToken: 'resetToken',
  resetTokenExpiry: 'resetTokenExpiry',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastLoginAt: 'lastLoginAt',
  status: 'status',
  role: 'role',
  canDelete: 'canDelete'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt',
  lastUsed: 'lastUsed',
  isActive: 'isActive'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.ReservationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  status: 'status',
  amount: 'amount',
  currency: 'currency',
  biletDukkaniOrderId: 'biletDukkaniOrderId',
  biletDukkaniRouteId: 'biletDukkaniRouteId',
  pnr: 'pnr',
  validUntil: 'validUntil',
  passengers: 'passengers',
  flightNumber: 'flightNumber',
  origin: 'origin',
  destination: 'destination',
  departureTime: 'departureTime',
  arrivalTime: 'arrivalTime',
  airline: 'airline',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  reservationId: 'reservationId',
  userId: 'userId',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  provider: 'provider',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PassengerScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  firstName: 'firstName',
  lastName: 'lastName',
  identityNumber: 'identityNumber',
  isForeigner: 'isForeigner',
  birthDay: 'birthDay',
  birthMonth: 'birthMonth',
  birthYear: 'birthYear',
  gender: 'gender',
  countryCode: 'countryCode',
  phone: 'phone',
  hasMilCard: 'hasMilCard',
  hasPassport: 'hasPassport',
  passportNumber: 'passportNumber',
  passportExpiry: 'passportExpiry',
  milCardNumber: 'milCardNumber',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  status: 'status',
  isAccountOwner: 'isAccountOwner'
};

exports.Prisma.PriceAlertScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  origin: 'origin',
  destination: 'destination',
  departureDate: 'departureDate',
  targetPrice: 'targetPrice',
  createdAt: 'createdAt',
  lastNotifiedPrice: 'lastNotifiedPrice'
};

exports.Prisma.SearchFavoriteScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  origin: 'origin',
  destination: 'destination',
  departureDate: 'departureDate',
  createdAt: 'createdAt'
};

exports.Prisma.SystemSettingsScalarFieldEnum = {
  id: 'id',
  maintenanceMode: 'maintenanceMode',
  maintenanceReason: 'maintenanceReason',
  maintenanceStart: 'maintenanceStart',
  estimatedDuration: 'estimatedDuration',
  backupEnabled: 'backupEnabled',
  backupSchedule: 'backupSchedule',
  backupRetention: 'backupRetention',
  backupDatabase: 'backupDatabase',
  backupUploads: 'backupUploads',
  backupLogs: 'backupLogs',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CampaignScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  imageUrl: 'imageUrl',
  imageData: 'imageData',
  altText: 'altText',
  linkUrl: 'linkUrl',
  status: 'status',
  position: 'position',
  clickCount: 'clickCount',
  viewCount: 'viewCount',
  startDate: 'startDate',
  endDate: 'endDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  createdBy: 'createdBy'
};

exports.Prisma.SurveyResponseScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  answers: 'answers',
  completedAt: 'completedAt',
  userAgent: 'userAgent',
  ipAddress: 'ipAddress',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SystemLogScalarFieldEnum = {
  id: 'id',
  level: 'level',
  message: 'message',
  source: 'source',
  userId: 'userId',
  metadata: 'metadata',
  timestamp: 'timestamp'
};

exports.Prisma.EmailTemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  subject: 'subject',
  content: 'content',
  type: 'type',
  language: 'language',
  variables: 'variables',
  status: 'status',
  usageCount: 'usageCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  createdBy: 'createdBy'
};

exports.Prisma.EmailQueueScalarFieldEnum = {
  id: 'id',
  recipient: 'recipient',
  cc: 'cc',
  bcc: 'bcc',
  subject: 'subject',
  content: 'content',
  templateId: 'templateId',
  priority: 'priority',
  status: 'status',
  scheduledAt: 'scheduledAt',
  sentAt: 'sentAt',
  errorMessage: 'errorMessage',
  retryCount: 'retryCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmailLogScalarFieldEnum = {
  id: 'id',
  cc: 'cc',
  bcc: 'bcc',
  subject: 'subject',
  content: 'content',
  templateId: 'templateId',
  status: 'status',
  sentAt: 'sentAt',
  deliveredAt: 'deliveredAt',
  openedAt: 'openedAt',
  clickedAt: 'clickedAt',
  bouncedAt: 'bouncedAt',
  errorMessage: 'errorMessage',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  trackingId: 'trackingId',
  bounceCount: 'bounceCount',
  bounceReason: 'bounceReason',
  campaignId: 'campaignId',
  clickCount: 'clickCount',
  createdAt: 'createdAt',
  deliveryTime: 'deliveryTime',
  emailId: 'emailId',
  openCount: 'openCount',
  recipientEmail: 'recipientEmail',
  recipientName: 'recipientName',
  retryCount: 'retryCount',
  spamScore: 'spamScore',
  templateName: 'templateName',
  updatedAt: 'updatedAt',
  userId: 'userId'
};

exports.Prisma.EmailSettingsScalarFieldEnum = {
  id: 'id',
  smtpHost: 'smtpHost',
  smtpPort: 'smtpPort',
  smtpUser: 'smtpUser',
  smtpPassword: 'smtpPassword',
  fromEmail: 'fromEmail',
  fromName: 'fromName',
  dailyLimit: 'dailyLimit',
  rateLimit: 'rateLimit',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BillingInfoScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  firstName: 'firstName',
  lastName: 'lastName',
  companyName: 'companyName',
  taxNumber: 'taxNumber',
  address: 'address',
  city: 'city',
  country: 'country',
  isDefault: 'isDefault',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SeoSettingsScalarFieldEnum = {
  id: 'id',
  siteTitle: 'siteTitle',
  siteDescription: 'siteDescription',
  keywords: 'keywords',
  canonicalUrl: 'canonicalUrl',
  ogTitle: 'ogTitle',
  ogDescription: 'ogDescription',
  ogImage: 'ogImage',
  twitterCard: 'twitterCard',
  facebookUrl: 'facebookUrl',
  twitterUrl: 'twitterUrl',
  instagramUrl: 'instagramUrl',
  robotsIndex: 'robotsIndex',
  robotsFollow: 'robotsFollow',
  googleVerification: 'googleVerification',
  yandexVerification: 'yandexVerification',
  organizationName: 'organizationName',
  organizationDescription: 'organizationDescription',
  organizationLogo: 'organizationLogo',
  organizationUrl: 'organizationUrl',
  organizationPhone: 'organizationPhone',
  organizationFounded: 'organizationFounded',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdminScalarFieldEnum = {
  id: 'id',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  password: 'password',
  role: 'role',
  status: 'status',
  permissions: 'permissions',
  lastLoginAt: 'lastLoginAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  createdBy: 'createdBy'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};


exports.Prisma.ModelName = {
  User: 'User',
  Account: 'Account',
  Session: 'Session',
  VerificationToken: 'VerificationToken',
  Reservation: 'Reservation',
  Payment: 'Payment',
  Passenger: 'Passenger',
  PriceAlert: 'PriceAlert',
  SearchFavorite: 'SearchFavorite',
  SystemSettings: 'SystemSettings',
  Campaign: 'Campaign',
  SurveyResponse: 'SurveyResponse',
  SystemLog: 'SystemLog',
  EmailTemplate: 'EmailTemplate',
  EmailQueue: 'EmailQueue',
  EmailLog: 'EmailLog',
  EmailSettings: 'EmailSettings',
  BillingInfo: 'BillingInfo',
  SeoSettings: 'SeoSettings',
  Admin: 'Admin'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        const runtime = detectRuntime()
        const edgeRuntimeName = {
          'workerd': 'Cloudflare Workers',
          'deno': 'Deno and Deno Deploy',
          'netlify': 'Netlify Edge Functions',
          'edge-light': 'Vercel Edge Functions or Edge Middleware',
        }[runtime]

        let message = 'PrismaClient is unable to run in '
        if (edgeRuntimeName !== undefined) {
          message += edgeRuntimeName + '. As an alternative, try Accelerate: https://pris.ly/d/accelerate.'
        } else {
          message += 'this browser environment, or has been bundled for the browser (running in `' + runtime + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
