import { logger } from "../../utils/logger";
import { AppError } from "../../utils/errors";

export interface OpenCodeZenClient {
  sendMessage: (message: string) => Promise<string>;
}

export class OpenCodeZenClientImpl implements OpenCodeZenClient {
  private readonly model: string = 'zen/kimi-k2.5';

  async sendMessage(message: string): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const proc = Bun.spawn(["opencode", "run", "-m", this.model, message], {
          stdout: "pipe",
          stderr: "pipe"
        });

        // Read the output
        const stdout = await new Response(proc.stdout).text();
        const stderr = await new Response(proc.stderr).text();

        // Wait for the process to exit
        const exitCode = await proc.exited;

        if (exitCode !== 0) {
          throw new AppError(`OpenCode Zen process failed with exit code ${exitCode}: ${stderr}`);
        }

        // OpenCode run returns plain text, not JSON
        return stdout.trim();
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Attempt ${attempt} failed: ${error}`);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        }
      }
    }

    throw new AppError(`Failed to send message after ${maxRetries} attempts: ${lastError}`);
  }
}

export const createOpenCodeZenClient = (): OpenCodeZenClient => {
  return new OpenCodeZenClientImpl();
};

// For direct use
const client = new OpenCodeZenClientImpl();
export const infer = async (input: string): Promise<string> => {
  return await client.sendMessage(input);
};