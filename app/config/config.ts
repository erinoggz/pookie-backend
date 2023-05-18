import { config } from 'dotenv';
config();

const configuration = {
  appname: 'PookieBackendService',
  mongo: {
    uri: process.env.DATABASE,
  },
  web: {
    port: process.env.PORT || '9099',
    jwt_secret: process.env.JWT_SECRET || 'pookiejfnkncr@22@50381.C03',
    jwt_refresh_secret:
      process.env.JWT_REFRESH_SECRET || 'pookiejreffnkncr@22@50381.C03',
    jwt_duration: process.env.JWT_DURATION || '1h',
    jwt_refresh_duration: process.env.JWT_REFRESH_DURATION || '1y',
    header_name: process.env.HEADER_NAME || 'x-auth-token',
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    db: parseInt(process.env.REDIS_DB) || 0,
  },
  sendgrid: {
    email_from: process.env.EMAIL_FROM,
    client_url: process.env.CLIENT_URL,
    merchant_url: process.env.MERCHANT_URL,
    sendgrid_api_key: process.env.SENDGRID_API_KEY,
    sendgrid_jwt_duration: process.env.JWT_DURATION || '10m',
  },
  stripe: {
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
    stripe_publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
  },
};

export default configuration;
