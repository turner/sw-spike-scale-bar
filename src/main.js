import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Add box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);
// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Calculate Screen-Space Width
function calculateScreenProjectedWidth(object, camera) {
    // Compute the bounding box for the object
    const box = new THREE.Box3().setFromObject(object);

    // Extract the corners of the bounding box
    const corners = [
        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
        new THREE.Vector3(box.min.x, box.max.y, box.min.z),
        new THREE.Vector3(box.max.x, box.min.y, box.min.z),
        new THREE.Vector3(box.max.x, box.max.y, box.min.z),
        new THREE.Vector3(box.min.x, box.min.y, box.max.z),
        new THREE.Vector3(box.min.x, box.max.y, box.max.z),
        new THREE.Vector3(box.max.x, box.min.y, box.max.z),
        new THREE.Vector3(box.max.x, box.max.y, box.max.z),
    ];

    // Transform the corners to world space and project to screen space
    const screenXCoordinates = corners.map(corner => {
        corner.applyMatrix4(object.matrixWorld); // Transform to world space
        corner.project(camera); // Project to NDC
        return (corner.x * 0.5 + 0.5) * window.innerWidth; // Convert to screen space
    });

    // Find the span of the X-coordinates in screen space
    const screenMinX = Math.min(...screenXCoordinates);
    const screenMaxX = Math.max(...screenXCoordinates);

    // Return the screen-space width
    return screenMaxX - screenMinX;
}

// Update Scale Bar
function updateScaleBar() {
    const scaleBar = document.getElementById('scale-bar');
    const screenWidth = calculateScreenProjectedWidth(box, camera);

    scaleBar.style.width = `${screenWidth}px`;
    scaleBar.textContent = `Scale: ${box.geometry.parameters.width} units`;
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Update the scale bar dynamically
    updateScaleBar();

    renderer.render(scene, camera);
}

animate();
