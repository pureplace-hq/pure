import fs from "fs";
import path from "path";
import { PureConfig } from "../types.js";

export function generateCNAME(config: PureConfig, outputDir: string): void {
  if (!config.domain) {
    return;
  }

  const domain = config.domain.replace(/^https?:\/\//, "");

  const cnamePath = path.join(outputDir, "CNAME");
  fs.writeFileSync(cnamePath, domain, "utf-8");

  console.log(`✓ CNAME file generated with domain: ${domain}`);
}
