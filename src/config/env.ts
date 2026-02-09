export interface Config {
  OPENROUTER_API_KEY: string;
}

const envVars = process.env;

if (!envVars.OPENROUTER_API_KEY) {
  throw new Error(
    'OPENROUTER_API_KEY is required. Please set it in your .env file.'
  );
}

export const config: Config = {
  OPENROUTER_API_KEY: envVars.OPENROUTER_API_KEY!
};