interface IEnvConfig {
  PORT: string;
  NODE_ENV: string;
  SQS_ACCESS_KEY: string;
  SQS_SECRET_KEY: string;
  DISCORD_API_KEY: string;
  PIPEDRIVE_QUEUE_URL: string;
  PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID: string;
  EMAIL_QUEUE_URL: string;
  CROSS_API_TOKEN: string;
  API_SECRET: string;
}

interface IAllowedHosts {
  AUTH_API_HOST: string;
  INSCRIPTIONS_API_HOST: string;
  DISCORD_API_HOST: string;
  PLEDU_API_HOST: string;
  INSCRIPTIONS_BFF_HOST: string;
}

export const config: IEnvConfig = (() => {
  const PORT = process.env.PORT;
  const NODE_ENV = process.env.NODE_ENV;
  const SQS_ACCESS_KEY = process.env.SQS_ACCESS_KEY;
  const SQS_SECRET_KEY = process.env.SQS_SECRET_KEY;
  const DISCORD_API_KEY = process.env.DISCORD_API_KEY;
  const PIPEDRIVE_QUEUE_URL = process.env.PIPEDRIVE_QUEUE_URL;
  const PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID =
    process.env.PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID;
  const EMAIL_QUEUE_URL = process.env.EMAIL_QUEUE_URL;
  const CROSS_API_TOKEN = process.env.CROSS_API_TOKEN;
  const API_SECRET = process.env.API_SECRET;

  if (
    !PORT ||
    !NODE_ENV ||
    !SQS_ACCESS_KEY ||
    !SQS_SECRET_KEY ||
    !DISCORD_API_KEY ||
    !PIPEDRIVE_QUEUE_URL ||
    !PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID ||
    !EMAIL_QUEUE_URL ||
    !CROSS_API_TOKEN ||
    !API_SECRET
  ) {
    const envs = {
      PORT,
      NODE_ENV,
      SQS_ACCESS_KEY,
      SQS_SECRET_KEY,
      DISCORD_API_KEY,
      PIPEDRIVE_QUEUE_URL,
      PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID,
      EMAIL_QUEUE_URL,
      CROSS_API_TOKEN,
      API_SECRET,
    };
    const missingVar = Object.entries(envs).find(
      ([, value]) => value === undefined
    );
    throw new Error(
      `Missing environment variable "${
        missingVar && missingVar[0]
      }". Please check your .env file`
    );
  }

  return {
    PORT,
    NODE_ENV,
    SQS_ACCESS_KEY,
    SQS_SECRET_KEY,
    DISCORD_API_KEY,
    PIPEDRIVE_QUEUE_URL,
    PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID,
    EMAIL_QUEUE_URL,
    CROSS_API_TOKEN,
    API_SECRET,
  };
})();

export const allowedHosts: IAllowedHosts = (() => {
  const AUTH_API_HOST = process.env.AUTH_API_HOST;
  const INSCRIPTIONS_API_HOST = process.env.INSCRIPTIONS_API_HOST;
  const DISCORD_API_HOST = process.env.DISCORD_API_HOST;
  const PLEDU_API_HOST = process.env.PLEDU_API_HOST;
  const INSCRIPTIONS_BFF_HOST = process.env.INSCRIPTIONS_BFF_HOST;

  if (
    !AUTH_API_HOST ||
    !INSCRIPTIONS_API_HOST ||
    !DISCORD_API_HOST ||
    !PLEDU_API_HOST ||
    !INSCRIPTIONS_BFF_HOST
  ) {
    const envs = {
      AUTH_API_HOST,
      INSCRIPTIONS_API_HOST,
      DISCORD_API_HOST,
      PLEDU_API_HOST,
      INSCRIPTIONS_BFF_HOST,
    };
    const missingVar = Object.entries(envs).find(
      ([, value]) => value === undefined
    );
    throw new Error(
      `Missing environment variable "${
        missingVar && missingVar[0]
      }". Please check your .env file`
    );
  }

  return {
    AUTH_API_HOST,
    INSCRIPTIONS_API_HOST,
    DISCORD_API_HOST,
    PLEDU_API_HOST,
    INSCRIPTIONS_BFF_HOST,
  };
})();
