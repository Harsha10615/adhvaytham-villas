import fs from 'fs';

try {
  fs.copyFileSync('dist/index.html', 'dist/404.html');
  console.log('Successfully copied dist/index.html to dist/404.html');
} catch (err) {
  console.error('Failed to copy index.html to 404.html:', err.message);
}
