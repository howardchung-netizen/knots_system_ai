import 'dotenv/config';

// ENV VARIABLES
export const {
  APP_ENV = 'development', // development | test | staging | production
  NODE_ENV = 'development',
  TZ = 'Asia/Hong_Kong',
  LOG_LEVEL = 'info',
  SERVER_KEEP_ALIVE_TIMEOUT = '650000',
  SERVER_HEADERS_TIMEOUT = '950000',
  APP_SECRET = 'APP_SECRET',
  PORT = 8003,
  DATABASE_URL = '',
  WEM_DATABASE_URL = '',
  WEM_DATABASE_PERFECTSHAPE_SQL_NAME = '',
  WEM_DATABASE_PS_KPI_NAME = '',
  WEM_DATABASE_POS_OFFLINE_SUPPLEMENT_NAME = '',
  INVENTORY_DATABASE_URL = '',
  INVENTORY_DATABASE_INVENTORY_RECORD_NAME = '',
  FACEDB_DATABASE_URL = '',
  PS_SYNC_ATTEND_API_URL = '',
  REDIS_URL = '',
  MEMBER_PHOTO_API = '',
  ENCRYPTION_KEY = 'secret_key',
  ENCRYPTION_IV = 'secret_iv',
  JWT_ISSUER = 'pos/api',
  DOMAIN = '',
  ADMIN_URL = '',
  START_CRON = 0,
  WEM_SYNC_LAST_SYNC_AT_OFFSET = '0',
  PS_API_URL = 'http://192.168.0.108:888',
  SMTP_HOST = '',
  SMTP_PORT = '',
  SMTP_SECURE = '',
  SMTP_USER = '',
  SMTP_PASS = '',
  SMTP_DEFAULT_FROM = 'Perfect Medical <no-reply@perfectmedical.com>',
  SMS_API_ENDPOINT = '',
  SMS_API_TOKEN = '',
  SMS_API_ENDPOINT_HK = '',
  SMS_API_ENDPOINT_MU = '',
  SMS_API_ENDPOINT_CN = '',
  WHATSAPP_TOOL_API_URL = '',
  WHATSAPP_TOOL_API_TOKEN = '',
  DEFAULT_CALENDAR_ID = '',
  EXPORT_PDF_SAVE_SERVER_TEMPORARY_TIME = '20000',
  EXPORT_PDF_ENDPOINT = '',
  COLUMN_CONFIG_KEY = '',
  TODO_DEV_ENDPOINT = '',
  WHATSAPP_CLOCKIN_URL = '',
  FIREBASE_KEY_PATH = '',
  BOOK_KEEPING_ACC_COMPANY_ID = '',
  BOOK_KEEPING_ACC_ASSET_TYPE_ID = '',
  BOOK_KEEPING_ACC_PETTY_CASH_PARENT_ID = '',
  WHATSAPP_META_PHONE_NUMBER_ID = '',
  WHATSAPP_META_APP_ID = '',
  WHATSAPP_META_APP_SECRET = '',
} = process.env;

const {
  TOKEN_COOKIE_NAME: tokenCookieName = 'token',
  TOKEN_COOKIE_MAX_AGE: tokenCookieMaxAge = '7889400000',
} = process.env;

export const TOKEN_COOKIE_NAME = tokenCookieName;
export const TOKEN_COOKIE_MAX_AGE = parseInt(tokenCookieMaxAge, 10);
export const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: TOKEN_COOKIE_MAX_AGE,
  sameSite: 'none' as const,
  secure: true,
};

// IS PRODUCTION
export const isProduction = NODE_ENV === 'production';

// WEB URL
export const webUrl = ADMIN_URL.split(',');

// CORS
export const cors = {
  credentials: true,
  origin: webUrl,
};

// GRAPHQL PATH
export const path = '/graphql';

// RESOLVER PATHS
export const resolverPaths = isProduction
  ? '/modules/**/*.resolver.js'
  : '/modules/**/*.resolver.ts';
