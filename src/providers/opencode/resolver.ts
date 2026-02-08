import { logger } from "../utils/logger";
import { AppError } from "../utils/errors";

export interface ModelResolver {
  getActiveModel: () => Promise<string>;
}

export class OpenCodeModelResolver implements ModelResolver {
  private static readonly PREFERRED_MODEL = "openrouter/moonshotai/kimi-k2.5";
  private static readonly FALLBACK_MODEL = "openrouter/arcee-ai/trinity-large-preview:free";

  async getActiveModel(): Promise<string> {
    try {
      // First try the preferred model
      const preferred = await this.testModel(OpenCodeModelResolver.PREFERRED_MODEL);
      if (preferred) {
        return OpenCodeModelResolver.PREFERRED_MODEL;
      }
    } catch (error) {
      logger.warn("Preferred model unavailable, attempting fallback:", error);
    }

    // Fallback to the backup model
    try {
      const fallback = await this.testModel(OpenCodeModelResolver.FALLBACK_MODEL);
      if (fallback) {
        logger.info("Using fallback model:", OpenCodeModelResolver.FALLBACK_MODEL);
        return OpenCodeModelResolver.FALLBACK_MODEL;
      }
    } catch (error) {
      logger.error("Both preferred and fallback models unavailable:", error);
      throw new AppError(`No available models: ${error}`);
    }

    // If we reach here, both models failed
    throw new AppError("No available models found");
  }

  private async testModel(model: string): Promise<boolean> {
    try {
      // Simple test: try to invoke the model with a basic prompt
      const proc = await Bun.spawn("opencode", ["run", "-m", model, "--format", "json"], {
        stdin: "pipe",
        stdout: "pipe",
        stderr: "pipe"
      });

      await proc.stdin.write("test");
      await proc.stdin.end();

      const stdout = await proc.stdout.read();
      const stderr = await proc.stderr.read();
      const exitCode = await proc.exitCode;

      if (exitCode === 0) {
        try {
          const response = JSON.parse(stdout);
          return typeof response.content === "string";
        } catch {
          return false;
        }
      }

      return false;
    } catch {
      return false;
    }
  }
}

export const createModelResolver = (): ModelResolver => {
  return new OpenCodeModelResolver();
};