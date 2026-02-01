// Simple build script for Original-odel repository
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

console.log('Starting build process...');

try {
  // Build client with Vite
  console.log('Building client...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Create dist directory
  mkdirSync('dist', { recursive: true });
  
  // Simple server build - just copy the file
  console.log('Building server...');
  const serverCode = `
import { serveStatic } from '../server/index-prod.js';
serveStatic();
`;
  writeFileSync(join('dist', 'index.js'), serverCode);
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
