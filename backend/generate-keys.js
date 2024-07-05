const { generateWasm, generateZKey } = require('@semaphore-protocol/contracts');
//import { generateWasm, generateZKey } from "@semaphore-protocol/contracts"

(async () => {
  await generateWasm('semaphore.wasm');
  await generateZKey('semaphore.wasm', 'semaphore.zkey');
})();
