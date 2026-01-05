console.log('✅ Node.js is working!');
console.log('📁 Current directory:', __dirname);
console.log('📄 Files in directory:');
const fs = require('fs');
fs.readdirSync(__dirname).forEach(file => {
  console.log('  -', file);
});
