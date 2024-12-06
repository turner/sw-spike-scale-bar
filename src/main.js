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

// Add a Plane
const planeWidth = 1; // World units
const planeHeight = 1; // World units
const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);

// Position and orient the plane to align with the viewing frustum
plane.position.z = -camera.near; // Align with the near plane
scene.add(plane);

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Calculate Screen-Space Width of the Plane
function calculateScreenProjectedWidth(object, camera) {
    const vertices = object.geometry.attributes.position.array;

    // Get the corners of the plane in world space
    const corners = [];
    for (let i = 0; i < vertices.length; i += 3) {
        const vertex = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
        vertex.applyMatrix4(object.matrixWorld); // Transform to world space
        corners.push(vertex);
    }

    // Project the corners into screen space
    const screenXCoordinates = corners.map(corner => {
        corner.project(camera); // Project to NDC
        return (corner.x * 0.5 + 0.5) * window.innerWidth; // Convert to screen space
    });

    // Find the span of the X-coordinates
    const screenMinX = Math.min(...screenXCoordinates);
    const screenMaxX = Math.max(...screenXCoordinates);

    // Return the screen-space width
    return screenMaxX - screenMinX;
}

// Update Scale Bar
function updateScaleBar() {
    const scaleBar = document.getElementById('scale-bar');
    const screenWidth = calculateScreenProjectedWidth(plane, camera);

    scaleBar.style.width = `${screenWidth}px`;
    scaleBar.textContent = `Scale: ${planeWidth} units`;
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Update the scale bar dynamically
    updateScaleBar();

    renderer.render(scene, camera);
}

animate();
