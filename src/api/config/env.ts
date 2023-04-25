interface IEnvConfig {
  port: string;
  env: string;
}

export const config: IEnvConfig = (() => {
  const port = process.env.PORT;
  const env = process.env.NODE_ENV;

  if (!port || !env) {
    const envs = { port, env };
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
    port,
    env,
  };
})();
