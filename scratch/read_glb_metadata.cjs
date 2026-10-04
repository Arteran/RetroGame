const fs = require('fs');
const path = require('path');

const glbPath = path.join(__dirname, '../nemesis/noot_fish.glb');
if (!fs.existsSync(glbPath)) {
  console.error('File not found:', glbPath);
  process.exit(1);
}

const buffer = fs.readFileSync(glbPath);
const chunk0Length = buffer.readUInt32LE(12);
const jsonString = buffer.toString('utf8', 20, 20 + chunk0Length);
const gltf = JSON.parse(jsonString);

console.log('\n--- Textures ---');
if (gltf.textures) {
  gltf.textures.forEach((tex, idx) => {
    console.log(`Texture ${idx}:`, JSON.stringify(tex, null, 2));
  });
}

console.log('\n--- Images ---');
if (gltf.images) {
  gltf.images.forEach((img, idx) => {
    console.log(`Image ${idx}: name="${img.name}", mimeType="${img.mimeType}"`);
  });
}
