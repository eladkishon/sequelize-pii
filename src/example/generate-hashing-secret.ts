const sodium = require('sodium-native');
const keyMaterial = Buffer.alloc(32, 0);
sodium.randombytes_buf(keyMaterial);

console.log(keyMaterial.toString('hex'));