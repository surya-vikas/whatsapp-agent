import { logger } from "../../utils/logger";
import { AppError } from "../../utils/errors";

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
      const proc = Bun.spawn(["opencode", "run", "-m", model, "test"], {
        stdout: "pipe",
        stderr: "pipe"
      });

      const stdout = await new Response(proc.stdout).text();
      const exitCode = await proc.exited;

      return exitCode === 0 && stdout.trim().length > 0;
    } catch {
      return false;
    }
  }
}

export const createModelResolver = (): ModelResolver => {
  return new OpenCodeModelResolver();
};

// Convenience function for direct use
const resolverInstance = new OpenCodeModelResolver();
export const getActiveModel = (): Promise<string> => resolverInstance.getActiveModel();