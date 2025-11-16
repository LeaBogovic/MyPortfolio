// A small module that isolates Screen glow and hitbox creation so it is easy to iterate.
// Import and call setupScreen(child, { scene, raycasterObjects, hitboxToObjectMap }) from the GLTF traverse
// where the Screen mesh is encountered.
//
// Usage (in src/main.js GLTF traverse):
// import { setupScreen } from "./screen-interaction.js";
// ...
// if (child.name.includes("Screen")) {
//   setupScreen(child, { scene, raycasterObjects, hitboxToObjectMap });
// }

import * as THREE from "three";

/**
 * Create a subtle additive glow mesh and a pointer hitbox for a screen mesh.
 * child: THREE.Mesh (the Screen mesh)
 * ctx: { scene, raycasterObjects, hitboxToObjectMap }
 */
export function setupScreen(child, ctx) {
  const { scene, raycasterObjects, hitboxToObjectMap } = ctx || {};

  if (!child || !scene) return;

  // Use a standard-type material if the current material doesn't support emissiveIntensity.
  // If the mesh already has a MeshStandardMaterial, keep it.
  try {
    const mat = child.material;
    if (!(mat && "emissiveIntensity" in mat)) {
      // Replace with a standard material that reuses the map (videoTexture)
      const map = mat && mat.map ? mat.map : null;
      child.material = new THREE.MeshStandardMaterial({
        map,
        transparent: true,
        opacity: 0.95,
        emissive: new THREE.Color(0xffc6ff),
        emissiveMap: map,
        emissiveIntensity: 0,
        metalness: 0.05,
        roughness: 0.6,
      });
    } else {
      // ensure emissive starts at 0
      child.material.emissiveIntensity = 0;
    }
  } catch (err) {
    console.warn("setupScreen: material replacement failed", err);
  }

  // Create glow mesh and parent to child (so it follows transforms).
  try {
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffc6ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
    });

    const glowGeom = child.geometry.clone();
    const glowMesh = new THREE.Mesh(glowGeom, glowMat);
    glowMesh.name = child.name + "_Glow";

    // local uniform scale so world-scale = parentScale * 1.04
    glowMesh.scale.set(1.04, 1.04, 1.04);
    glowMesh.position.set(0, 0, 0);
    glowMesh.rotation.set(0, 0, 0);
    glowMesh.frustumCulled = false;
    glowMesh.renderOrder = (child.renderOrder || 0) + 1000;

    child.add(glowMesh);
    child.userData._glowMesh = glowMesh;
  } catch (err) {
    console.warn("setupScreen: could not create glow mesh", err);
  }

  // Create a pointer-style hitbox and register it with the raycaster arrays
  if (typeof createHitbox === "function") {
    // prefer local helper if available; else fallback to simple bbox
  }

  // Simple bounding box hitbox (keeps same API as existing hitboxes)
  try {
    // Compute world bounding box of the screen mesh
    const box = new THREE.Box3().setFromObject(child);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const sizeMultiplier = { x: 1.02, y: 1.02, z: 1.02 };
    const hitboxGeometry = new THREE.BoxGeometry(
      Math.max(size.x * sizeMultiplier.x, 0.01),
      Math.max(size.y * sizeMultiplier.y, 0.01),
      Math.max(size.z * sizeMultiplier.z, 0.01)
    );

    const hitboxMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      visible: false,
    });

    const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
    hitbox.position.copy(center);
    hitbox.name = child.name + "_Pointer_Hitbox";
    hitbox.userData.originalObject = child;

    // Add to scene and register
    if (scene && hitbox) {
      scene.add(hitbox);
    }
    if (raycasterObjects && Array.isArray(raycasterObjects)) {
      raycasterObjects.push(hitbox);
    }
    if (hitboxToObjectMap && hitbox instanceof Object) {
      hitboxToObjectMap.set(hitbox, child);
    }
  } catch (err) {
    console.warn("setupScreen: hitbox creation failed", err);
  }
}

export function teardownScreen(child) {
  if (!child) return;
  const glow = child.userData && child.userData._glowMesh;
  if (glow && glow.parent) glow.parent.remove(glow);
  if (child.userData) {
    delete child.userData._glowMesh;
  }
}