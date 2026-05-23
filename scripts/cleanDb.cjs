const { execSync } = require('child_process');

const collections = [
  'orders', 'logs', 'restockRequests',
  'reviews', 'users', 'adminLogs', 'newsletter',
  'abandonedCheckouts'
];

for (const col of collections) {
  console.log(`Deleting collection: ${col}`);
  try {
    execSync(`npx firebase firestore:delete ${col} -r -f --project zahrah-boutique`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Error deleting ${col}:`, err.message);
  }
}
console.log('Database wiped!');
