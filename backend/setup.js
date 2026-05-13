const bcrypt = require('bcryptjs');

// Script to generate bcrypt password hashes

function generateHash(password) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

// Get password from command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Uso: node setup.js <password>');
  console.log('');
  console.log('Ejemplo:');
  console.log('  node setup.js mypassword123');
  console.log('');
  console.log('Para generar hashes para ambos usuarios:');
  console.log('  node setup.js nacho-password');
  console.log('  node setup.js pancho-password');
  process.exit(1);
}

const password = args[0];
const hash = generateHash(password);

console.log('');
console.log('========================================');
console.log('Password Hash Generator');
console.log('========================================');
console.log('');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('');
console.log('Add this to your .env file:');
console.log('');
if (password.toLowerCase().includes('nacho')) {
  console.log(`USER_NACHO_PASSWORD_HASH=${hash}`);
} else if (password.toLowerCase().includes('pancho')) {
  console.log(`USER_PANCHO_PASSWORD_HASH=${hash}`);
} else {
  console.log(`# Copy the appropriate line to .env:`);
  console.log(`# For user 'Nacho': USER_NACHO_PASSWORD_HASH=${hash}`);
  console.log(`# For user 'Pancho': USER_PANCHO_PASSWORD_HASH=${hash}`);
}
console.log('');
console.log('========================================');
