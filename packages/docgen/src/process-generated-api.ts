import fs from 'fs-extra';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { convertApiJSONToMarkdown } from './converters/converters';
import { TopLevelFields } from './models/models';
import { isDirectoryExist } from './utils/file';

(async () => {
  const cwd = process.cwd();
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 <command> [options]')
    .demandCommand(2)
    .command(
      'gen-md',
      'Generates documentation files from the output of typedoc JSON',
      (yargs) => {
        return yargs
          .positional('input', {
            describe: 'the path to the JSON output of typedoc'
          })
          .positional('output', { describe: 'the docs output' });
      }
    )
    .example(
      '$0 gen-md api.json src/pages/docs',
      'generates documentation files from api.json and outputs it into src/pages/docs folder'
    )
    .parse();

  const [_command, input, output] = argv._;
  const file = await fs.readFile(path.join(process.cwd(), `${input}`), 'utf-8');

  // Clean output folder.
  const outDirPath = path.join(cwd, `${output}`);

  await Promise.allSettled([
    fs.rm(path.join(outDirPath, 'components'), { force: true }),
    fs.rm(path.join(outDirPath, 'types'), { force: true }),
    fs.rm(path.join(outDirPath, 'functions'), { force: true })
  ]);

  await Promise.allSettled([
    fs.mkdirp(path.join(outDirPath, 'components')),
    fs.mkdirp(path.join(outDirPath, 'types')),
    fs.mkdirp(path.join(outDirPath, 'functions'))
  ]);

  const json = JSON.parse(file) as TopLevelFields;
  const contents = convertApiJSONToMarkdown(json, 'md');

  await Promise.allSettled(
    Object.entries(contents).map(async ([filePath, content]) => {
      const targetPath = path.join(outDirPath, filePath);
      const targetDir = path.dirname(targetPath);
      const isExist = await isDirectoryExist(targetDir);

      if (!isExist) {
        await fs.mkdir(targetDir, { recursive: true });
      }

      return fs.writeFile(targetPath, content, {
        encoding: 'utf-8'
      });
    })
  );
})();
