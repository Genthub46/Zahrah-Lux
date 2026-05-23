
import { seedInitialData } from '../services/dbUtils';
import { INITIAL_PRODUCTS, INITIAL_HOME_LAYOUT, INITIAL_FOOTER_PAGES } from '../constants';

console.log('Repairing database with initial products...');

seedInitialData(INITIAL_PRODUCTS, INITIAL_HOME_LAYOUT, INITIAL_FOOTER_PAGES)
  .then(() => {
    console.log('Successfully seeded database!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  });
