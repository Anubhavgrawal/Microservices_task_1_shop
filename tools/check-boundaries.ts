/**
 * Task 1 - build this.
 *
 * Walk every .ts file under src/modules and look at its imports.
 * A module may import:
 *   - its own files
 *   - anything under src/platform
 *   - another module's index.ts  -  and nothing else
 *
 * Anything else is a violation.
 *
 * Running this file directly should print the violations and exit 1 when
 * there are any, 0 when there are none.
 *
 * No dependencies. node:fs and node:path are enough. Remember that a
 * type-only import still couples one module to another.
 */

import * as fs from "node:fs";
import { join } from "node:path";

export interface Violation {
  file: string;
  importPath: string;
  reason: string;
}

export function findViolations(root: string): Violation[] {
  const violations: Violation[] = [];
  const modules = new Set(["inventory", "orders", "payments", "notifications"]);
  const filepaths = fs.readdirSync(join(root, "modules"), {
      recursive: true,
      withFileTypes: true,
    });

  for (const file of filepaths) {
    if (!file.isFile() || !file.name.endsWith(".ts")) continue;

    const filePath = join(file.parentPath, file.name);
    const currentModule = [...modules].find((module) =>
      filePath.includes(`/modules/${module}/`),
    );
    if (!currentModule) continue;

    const content = fs.readFileSync(filePath, "utf-8");
    for (const line of content.split(/\r?\n/)) {
      const importPath = line.match(/\bfrom\s+["']([^"']+)["']/)?.[1]
        ?? line.match(/^\s*import\s+["']([^"']+)["']/)?.[1];
      if (!importPath?.startsWith("../")) continue;

      const targetModule = [...modules].find((module) =>
        importPath.includes(`../${module}/`),
      );
      if (!targetModule || importPath.includes("../platform/") ||
          (targetModule !== currentModule && importPath.endsWith("/index.ts"))) {
        continue;
      }

      violations.push({
        file: filePath,
        importPath: line,
        reason: "importing from another module excluding platform",
      });
    }
  }

  return violations;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const violations = findViolations("./src");
    console.log("Violations:", violations);
    process.exitCode = violations.length > 0 ? 1 : 0;
  } catch (error) {
    console.error("Failed to check files:", error);
    process.exitCode = 1;
  }
}
