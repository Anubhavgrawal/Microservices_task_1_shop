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

import * as fs from "node:fs/promises";
import { join } from "node:path";

export interface Violation {
  file: string;
  importPath: string;
  reason: string;
}

export async function findViolations(root: string): Promise<Violation[]> {
  const violations: Violation[] = [];
  const currentfolder = ["inventory", "orders", "payments", "notifications"];

  async function rootstructure(rootfolder: string): Promise<void> {
    //extract all foles paths
    const filepaths = await fs.readdir(rootfolder, {
      recursive: true,
      withFileTypes: true,
    });

    for (const file of filepaths) {
      if (file.isFile() && file.name.endsWith(".ts")) {
        const filePath = join(file.parentPath, file.name);
        let currentmodule ;
        if(currentfolder.some((folder) => file.parentPath.includes(`/${folder}/`))){
          currentmodule = currentfolder.find((folder)=>file.parentPath.includes(`/${folder}/`));
        }
        // console.log(filePath);
        const content = await fs.readFile(filePath, "utf-8");

        for (const line of content.split(/\r?\n/)) {
          // let goingmodule;
          // if(currentfolder.some((folder) => line.includes(`/${folder}/`))){
          //   goingmodule = currentfolder.find((folder)=>line.includes(`/${folder}/`));
          // }
          if (
            line.trim().startsWith("import ") &&
            line.includes("../") &&
            !line.includes("/platform/") &&
            !line.includes("index.ts")
          ) {
            const goingmodule = currentfolder.find((folder) =>
              line.includes(`/${folder}/`)
            );
            // console.log(`your file ${filePath} has voileted the import rule by importing ${line}`);
            //create a violation object
            if((currentmodule && goingmodule && currentmodule !== goingmodule) || (goingmodule)){
              const violation: Violation = {
              file: filePath,
              importPath: line,
              reason: "importing from another module excluding platform",
              };
              violations.push(violation);
            }
          }
        }
      }
    }
  }

  await rootstructure(root);
  return violations;
}
findViolations("./src/modules")
  .then((violations) => {
    console.log("Violations:", violations);
    process.exitCode = violations.length > 0 ? 1 : 0;
  })
  .catch((error) => {
    console.error("Failed to check files:", error);
    process.exitCode = 1;
  });
