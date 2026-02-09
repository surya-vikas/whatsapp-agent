import { logger } from "../../utils/logger";
import { AppError } from "../../utils/errors";

export const infer = async (input: string): Promise<string> => {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const proc = Bun.spawn(["opencode", "run", "-m", "mistral/mistral-7b", input], {
        stdout: "pipe",
        stderr: "pipe"
      });

      // Read the output
      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();

      // Wait for the process to exit
      const exitCode = await proc.exited;

      if (exitCode !== 0) {
        throw new AppError(`Mistral process failed with exit code ${exitCode}: ${stderr}`);
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
};