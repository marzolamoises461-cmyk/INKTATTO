const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const backendDir = path.join(root, 'backend');
const envPath = path.join(backendDir, '.env');
const examplePath = path.join(backendDir, '.env.example');

if (!fs.existsSync(envPath)) {
  if (!fs.existsSync(examplePath)) {
    console.error('No se encontró backend/.env.example. Actualiza el repositorio e inténtalo de nuevo.');
    process.exit(1);
  }
  let env = fs.readFileSync(examplePath, 'utf8');
  env = env.replace(/^JWT_SECRET=.*$/m, 'JWT_SECRET=' + crypto.randomBytes(48).toString('base64url'));
  fs.writeFileSync(envPath, env, { flag: 'wx' });
  console.log('✓ Se creó backend/.env con una clave JWT local segura.');
} else {
  console.log('✓ Se conserva backend/.env existente.');
}

console.log('Iniciando MySQL local con Docker Compose...');
const docker = spawnSync('docker', ['compose', 'up', '-d', 'mysql'], {
  cwd: root, stdio: 'inherit', shell: process.platform === 'win32',
});
if (docker.error || docker.status !== 0) {
  console.error('\nNo se pudo iniciar MySQL. Instala y abre Docker Desktop y vuelve a ejecutar: npm run dev');
  process.exit(docker.status || 1);
}
console.log('\n✓ MySQL solicitado. Iniciando API y página web...');
