import * as THREE from 'three';

/**
 * Returns a new vector with the minimum components of two vectors.
 * @param {THREE.Vector3} v1 - The first vector.
 * @param {THREE.Vector3} v2 - The second vector.
 * @returns {THREE.Vector3} - A new vector with the minimum components.
 */
function vectorMin(v1, v2) {
    return new THREE.Vector3(
        Math.min(v1.x, v2.x),
        Math.min(v1.y, v2.y),
        Math.min(v1.z, v2.z)
    );
}

/**
 * Returns a new vector with the maximum components of two vectors.
 * @param {THREE.Vector3} v1 - The first vector.
 * @param {THREE.Vector3} v2 - The second vector.
 * @returns {THREE.Vector3} - A new vector with the maximum components.
 */
function vectorMax(v1, v2) {
    return new THREE.Vector3(
        Math.max(v1.x, v2.x),
        Math.max(v1.y, v2.y),
        Math.max(v1.z, v2.z)
    );
}

export { vectorMin, vectorMax }
