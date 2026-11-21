const fs = require('fs');
const path = require('path');

const root = __dirname;
const output = path.join(root, 'public');
const files = ['index.html', 'styles.css', 'app.js', 'enhancements.js'];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of files) {
  const source = path.join(root, file);
  if (!fs.existsSync(source)) {
    throw new Error(`Required static asset is missing: ${file}`);
  }
  fs.copyFileSync(source, path.join(output, file));
}

const assetsDir = path.join(root, 'assets');
if (fs.existsSync(assetsDir)) {
  fs.cpSync(assetsDir, path.join(output, 'assets'), { recursive: true });
}
console.log(`MIMORA static build complete: ${files.length} files and illustration assets copied to public/.`);
