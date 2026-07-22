const { execSync } = require('node:child_process');
const fs = require('node:fs');

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: 'inherit', shell: '/bin/bash' });
}

const parts = fs
  .readdirSync('.import2')
  .filter((name) => /^part-\d+$/.test(name))
  .sort();

if (parts.length !== 11) {
  throw new Error(`Expected 11 source blocks, found ${parts.length}`);
}

run(': > /tmp/gotchu.tar.xz');
for (const name of parts) {
  run(`base64 --decode .import2/${name} >> /tmp/gotchu.tar.xz`);
}
run('xz --test /tmp/gotchu.tar.xz');
run('tar -xJf /tmp/gotchu.tar.xz -C .');

for (const required of ['package.json', 'vite.config.ts', 'src/routes/index.tsx']) {
  if (!fs.existsSync(required)) throw new Error(`Missing ${required} after extraction`);
}

run('npm install --no-audit --no-fund');
run('npm run build');
