import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-action-docker-metadata-'));

process.env = Object.assign({}, process.env, {
  TEMP: tmpDir,
  GITHUB_REPOSITORY: 'LiquidLogicLabs/git-action-docker-metadata',
  RUNNER_TEMP: path.join(tmpDir, 'runner-temp'),
  RUNNER_TOOL_CACHE: path.join(tmpDir, 'runner-tool-cache')
});
