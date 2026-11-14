const { spawnSync } = require('node:child_process');

const major = Number(process.versions.node.split('.')[0]);
const npm = spawnSync('npm', ['--version'], { encoding: 'utf8', shell: process.platform === 'win32' });
const docker = spawnSync('docker', ['compose', 'version'], { encoding: 'utf8', shell: process.platform === 'win32' });

let failed = false;
console.log('INKTATTO - comprobación del entorno local\n');
console.log(`Node.js: ${process.version} ${major >= 22 && major < 25 ? '✓' : '✗ (se requiere 22.12 o superior, menor que 25)'}`);
if (major < 22 || major >= 25) failed = true;
if (npm.error || npm.status !== 0) {
  console.log('npm: ✗ No se encontró npm. Instala Node.js 22 LTS.');
  failed = true;
} else {
  const npmMajor = Number(npm.stdout.trim().split('.')[0]);
  console.log(`npm: ${npm.stdout.trim()} ${npmMajor >= 10 ? '✓' : '✗ (se requiere npm 10 o superior)'}`);
  if (npmMajor < 10) failed = true;
}
if (docker.error || docker.status !== 0) {
  console.log('Docker Compose: ✗ No disponible. Instala y abre Docker Desktop para ejecutar la base de datos local.');
  failed = true;
} else {
  console.log(`Docker Compose: ${docker.stdout.trim()} ✓`);
}
if (failed) process.exitCode = 1;
else console.log('\nTodo listo. Ejecuta: npm i && npm run dev');
