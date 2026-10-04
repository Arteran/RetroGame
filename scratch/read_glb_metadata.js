const fs = require('fs');
const path = require('path');

const glbPath = path.join(__dirname, '../nemesis/noot_fish.glb');
if (!fs.existsSync(glbPath)) {
  console.error('File not found:', glbPath);
  process.exit(1);
}

const buffer = fs.readFileSync(glbPath);

// GLB header: magic (4 bytes), version (4 bytes), length (4 bytes)
const magic = buffer.toString('utf8', 0, 4);
const version = buffer.readUInt32LE(4);
const length = buffer.readUInt32LE(8);

console.log(`GLB Magic: ${magic}, Version: ${version}, Length: ${length}`);

// Chunk 0 header: chunkLength (4 bytes), chunkType (4 bytes)
const chunk0Length = buffer.readUInt32LE(12);
const chunk0Type = buffer.toString('utf8', 16, 20);

console.log(`Chunk 0 Length: ${chunk0Length}, Type: ${chunk0Type}`);

if (chunk0Type === 'JSON') {
  const jsonString = buffer.toString('utf8', 20, 20 + chunk0Length);
  const gltf = JSON.parse(jsonString);
  
  console.log('\n--- Animations ---');
  if (gltf.animations) {
    gltf.animations.forEach((anim, idx) => {
      console.log(`Animation ${idx}: "${anim.name}"`);
    });
  } else {
    console.log('No animations found');
  }

  console.log('\n--- Nodes ---');
  if (gltf.nodes) {
    gltf.nodes.forEach((node, idx) => {
      if (node.name) {
        console.log(`Node ${idx}: "${node.name}"` + (node.mesh !== undefined ? ` (Mesh: ${node.mesh})` : ''));
      }
    });
  }

  console.log('\n--- Meshes ---');
  if (gltf.meshes) {
    gltf.meshes.forEach((mesh, idx) => {
      console.log(`Mesh ${idx}: "${mesh.name}"`);
    });
  }
} else {
  console.error('Chunk 0 is not JSON!');
}
