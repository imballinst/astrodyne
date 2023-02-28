import fs from 'fs-extra';
import path from 'path';
import { convertApiJSONToMarkdown } from './converters/converters';
import { TopLevelFields } from './models/models';

(async () => {
  // <node> <process-generated-api.ts> <args0>
  const cwd = process.cwd();
  const [outputDirectory] = process.argv.slice(2);

  if (!outputDirectory) {
    throw new Error('please add 2nd argument: output directory');
  }

  const file = await fs.readFile(path.join(process.cwd(), 'api.json'), 'utf-8');

  // Clean output folder.
  const outDirPath = path.join(cwd, outputDirectory);

  await Promise.allSettled([
    fs.rm(path.join(outDirPath, 'docs/components'), { force: true }),
    fs.rm(path.join(outDirPath, 'docs/types'), { force: true }),
    fs.rm(path.join(outDirPath, 'docs/functions'), { force: true })
  ]);

  await Promise.allSettled([
    fs.mkdirp(path.join(outDirPath, 'docs/components')),
    fs.mkdirp(path.join(outDirPath, 'docs/types')),
    fs.mkdirp(path.join(outDirPath, 'docs/functions'))
  ]);

  const json = JSON.parse(file) as TopLevelFields;
  const contents = convertApiJSONToMarkdown(json);

  await Promise.allSettled(
    Object.entries(contents).map(([filePath, content]) =>
      fs.writeFile(path.join(outDirPath, filePath), content, {
        encoding: 'utf-8'
      })
    )
  );
})();
