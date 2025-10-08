import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { execFile } from 'node:child_process';

async function collectJsFiles (dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectJsFiles(path);
    }
    if (entry.isFile() && entry.name.endsWith('.js')) {
      return [path];
    }
    return [];
  }));
  return files.flat();
}

function checkFile (file) {
  return new Promise((resolve, reject) => {
    execFile(process.execPath, ['--check', file], (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr.toString() || error.message));
        return;
      }
      resolve(stdout.toString());
    });
  });
}

async function main () {
  const files = await collectJsFiles('src');
  for (const file of files) {
    await checkFile(file);
    console.log(`✔️  Sintaxis válida: ${file}`);
  }
  console.log('Revisión completada.');
}

main().catch((error) => {
  console.error('Error en lint:', error.message);
  process.exit(1);
});
