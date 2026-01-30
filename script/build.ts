// Simple build script for Original-odel repository
import { execSync } from 'child_process';

console.log('Starting build process...');

try {
  // Build client with Vite
  console.log('Building client...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Build server with esbuild
  console.log('Building server...');
  execSync('esbuild server/index-prod.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
