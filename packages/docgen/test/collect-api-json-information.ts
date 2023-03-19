import fs from 'fs-extra';
import path from 'path';

interface AllApiOutputInfo {
  kindStrings: Set<string>;
  sources: any[];
  comment: any[];
  groups: any[];
  flags: any[];
  signatures: any[];
  // Declaration types.
  reflections: any[];
  intrinsics: any[];
  literals: any[];
  references: any[];
}

async function main() {
  const content = await fs.readFile(
    path.join(process.cwd(), '../example/api.json'),
    'utf-8'
  );
  const json = JSON.parse(content);

  const result: AllApiOutputInfo = {
    kindStrings: new Set(),
    comment: [],
    sources: [],
    groups: [],
    flags: [],
    signatures: [],
    // Declaration types.
    reflections: [],
    intrinsics: [],
    literals: [],
    references: []
  };

  dive(json, result);

  const keys = Object.keys(result) as Array<keyof AllApiOutputInfo>;
  await Promise.all(
    keys.map((key) => {
      let obj: any = {};
      if (result[key] instanceof Set) {
        obj = Array.from(result[key]);
      } else {
        obj = result[key];
      }

      fs.writeFile(
        path.join(process.cwd(), `src/test-resources/${key}.json`),
        JSON.stringify(obj, null, 2),
        'utf-8'
      );
    })
  );
}

main();

// Helper functions.
function dive(json: any, result: AllApiOutputInfo) {
  if (!json) return;

  if (json.kindString) result.kindStrings.add(json.kindString);
  if (json.comment) result.comment.push(json.comment);
  if (json.sources) result.sources.push(json.sources);
  if (json.groups) result.groups.push(json.groups);
  if (json.signatures) result.signatures.push(json.signatures);
  if (json.flags && Object.keys(json.flags).length > 0) {
    result.flags.push(json.flags);
  }

  // Declaration types.
  if (json.type?.type === 'reflection') result.reflections.push(json.type);
  if (json.type?.type === 'intrinsic') result.intrinsics.push(json.type);
  if (json.type?.type === 'literal') result.literals.push(json.type);
  if (json.type?.type === 'reference') result.references.push(json.type);

  if (json.children) {
    for (const child of json.children) {
      dive(child, result);
    }
  }
}
