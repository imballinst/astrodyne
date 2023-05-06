import fs from 'fs-extra';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { convertApiJSONToMarkdown } from './converters/converters';
import { TopLevelFields } from './models/models';
import { isDirectoryExist } from './utils/file';
import { FileExtension, OutputMode } from './utils/mode';

(async () => {
  const cwd = process.cwd();
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 <command> [options]')
    .command(
      'gen-md',
      'Generates documentation files from the output of typedoc JSON',
      (yargs) => {
        return yargs
          .positional('input', {
            describe: 'the path to the JSON output of typedoc'
          })
          .positional('output', { describe: 'the docs output' })
          .demandCommand()
          .example(
            '$0 gen-md api.json src/pages/docs',
            'generates documentation files from api.json and outputs it into src/pages/docs folder'
          )
          .option('file-extension', {
            describe: 'The output file extension',
            choices: [FileExtension.MD, FileExtension.MDX],
            default: FileExtension.MD
          })
          .option('mode', {
            describe:
              'The output mode, choose "plain-markdown" for showing only in Git repository, otherwise "processed-markdown" for processing it using framework like Astro.',
            choices: [OutputMode.PLAIN_MARKDOWN, OutputMode.PROCESSED_MARKDOWN],
            default: 'plain-markdown'
          })
          .option('trailing-slash', {
            describe:
              'Whether trailing slash is enabled or not in the hosting platform. Further reference: https://github.com/slorber/trailing-slash-guide.',
            boolean: true,
            default: true
          });
      }
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
  const contents = await convertApiJSONToMarkdown({
    json,
    mode: argv.mode as OutputMode,
    fileExtension: argv.fileExtension as FileExtension,
    isTrailingSlashUsed: argv.trailingSlash as boolean,
    input: `${input}`
  });

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
