const bcrypt = require('bcryptjs');

// Quick script to generate password hashes
const password = process.argv[2] || 'password123';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('\nGenerated Hash:');
console.log(hash);
console.log('\nTo verify:');
console.log('Valid:', bcrypt.compareSync(password, hash));
