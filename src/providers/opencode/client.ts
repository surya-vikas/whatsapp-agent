import { logger } from "../../utils/logger";
import { AppError } from "../../utils/errors";

export interface OpenCodeClient {
  sendMessage: (message: string, model: string) => Promise<string>;
}

export class OpenCodeClientImpl implements OpenCodeClient {
  private readonly model: string;

  constructor(model: string) {
    this.model = model;
  }

  async sendMessage(message: string, model: string): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const proc = Bun.spawn(["opencode", "run", "-m", model, message], {
          stdout: "pipe",
          stderr: "pipe"
        });

        // Read the output
        const stdout = await new Response(proc.stdout).text();
        const stderr = await new Response(proc.stderr).text();

        // Wait for the process to exit
        const exitCode = await proc.exited;

        if (exitCode !== 0) {
          throw new AppError(`OpenCode process failed with exit code ${exitCode}: ${stderr}`);
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

export const createOpenCodeClient = (model: string): OpenCodeClient => {
  return new OpenCodeClientImpl(model);
};