import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const distDir = join(projectRoot, 'dist');

async function prepareDist () {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
}

async function copyAssets () {
  await cp(join(projectRoot, 'manifest.json'), join(distDir, 'manifest.json'));
  await cp(join(projectRoot, 'src'), distDir, { recursive: true });
  await cp(join(projectRoot, 'README.md'), join(distDir, 'README.md'));
}

async function main () {
  await prepareDist();
  await copyAssets();
  console.log('Carpeta dist lista. Carga dist/ en Chrome > Extensiones > Modo desarrollador.');
}

main().catch((error) => {
  console.error('Error en build', error);
  process.exit(1);
});
