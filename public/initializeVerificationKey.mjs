// initializeVerificationKey.js

import fs from 'fs';
import path from 'path';
import { storeVerificationKey } from '../utils/inviteCodeUtils'; // Adjust the import path as necessary

async function main() {
  try {
    const keyPath = path.join(process.cwd(), 'public/verification_key.json');
    const key = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));

    await storeVerificationKey(key);
    console.log('Verification key has been stored successfully.');
  } catch (error) {
    console.error('Error storing verification key:', error);
  }
}

main();
