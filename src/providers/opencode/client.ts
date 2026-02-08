import { spawn } from "bun";
import { logger } from "../utils/logger";
import { AppError } from "../utils/errors";

export interface OpenCodeClient {
  sendMessage: (message: string, model: string) => Promise<string>;
}

export class OpenCodeClientImpl implements OpenCodeClient {
  private readonly model: string;

  constructor(model: string) {
    this.model = model;
  }

  async sendMessage(message: string, model: string): Promise<string> {
    try {
      const proc = await spawn("opencode", ["run", "-m", model, "--format", "json"], {
        stdin: "pipe",
        stdout: "pipe",
        stderr: "pipe"
      });

      // Write the message to stdin
      await proc.stdin.write(message);
      await proc.stdin.end();

      // Read the output
      const stdout = await proc.stdout.read();
      const stderr = await proc.stderr.read();

      // Wait for the process to exit
      const exitCode = await proc.exitCode;

      if (exitCode !== 0) {
        throw new AppError(`OpenCode process failed with exit code ${exitCode}: ${stderr}`);
      }

      try {
        const response = JSON.parse(stdout);
        return response.content || "";
      } catch (parseError) {
        throw new AppError(`Failed to parse OpenCode response: ${stdout}`);
      }
    } catch (error) {
      logger.error("OpenCode client error:", error);
      throw new AppError(`Failed to send message to OpenCode: ${error}`);
    }
  }
}

export const createOpenCodeClient = (model: string): OpenCodeClient => {
  return new OpenCodeClientImpl(model);
};