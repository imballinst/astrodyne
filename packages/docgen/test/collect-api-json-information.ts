import fs from 'fs-extra';
import path from 'path';

interface AllApiOutputInfo {
  kindStrings: Set<string>;
}

async function main() {
  const content = await fs.readFile(
    path.join(process.cwd(), 'example/api.json'),
    'utf-8'
  );
  const json = JSON.parse(content);

  const result: AllApiOutputInfo = {
    kindStrings: new Set()
  };

  dive(json, result);

  await fs.writeFile(
    path.join(process.cwd(), 'src/test-resources/kind-strings.json'),
    JSON.stringify(Array.from(result.kindStrings)),
    'utf-8'
  );
}

main();

// Helper functions.
function dive(json: any, result: AllApiOutputInfo) {
  if (!json) return;

  if (json.kindString) result.kindStrings.add(json.kindString);
  if (json.children) {
    for (const child of json.children) {
      dive(child, result);
    }
  }
}
