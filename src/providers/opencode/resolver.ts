import { logger } from "../../utils/logger";
import { AppError } from "../../utils/errors";

export interface ModelResolver {
  getActiveModel: (provider: string) => Promise<string>;
}

export class OpenCodeModelResolver implements ModelResolver {
  private static readonly PREFERRED_MODELS: Record<string, string> = {
    opencode: "openrouter/moonshotai/kimi-k2.5",
    opencodezen: "opencode/zen/kimi-k2.5",
    mistral: "mistral/mistral-7b"
  };
  private static readonly FALLBACK_MODEL = "openrouter/arcee-ai/trinity-large-preview:free";

  async getActiveModel(provider: string): Promise<string> {
    try {
      const preferredModel = OpenCodeModelResolver.PREFERRED_MODELS[provider] || OpenCodeModelResolver.PREFERRED_MODELS.opencode;

      // First try the preferred model
      const preferred = await this.testModel(preferredModel);
      if (preferred) {
        return preferredModel;
      }
    } catch (error) {
      logger.warn(`${provider} preferred model unavailable, attempting fallback:`, error);
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
export const getActiveModel = (provider: string): Promise<string> => resolverInstance.getActiveModel(provider);