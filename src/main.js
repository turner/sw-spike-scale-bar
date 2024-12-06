import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

let geometry
let material
let mesh

// Box
// geometry = new THREE.BoxGeometry(1, 1, 1);
// material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
// mesh = new THREE.Mesh(geometry, material);

// Twisted Torus
geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16); // Customize as needed
material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
mesh = new THREE.Mesh(geometry, material);

// Plane
// const planeWidth = 1; // World units
// const planeHeight = 1; // World units
// geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
// material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
// mesh = new THREE.Mesh(geometry, material);
//
// // Position and orient the plane to align with the viewing frustum
// mesh.position.z = -camera.near; // Align with the near plane




scene.add(mesh)




// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function calculateScreenProjectedWidth(object, camera) {

    const bbox = new THREE.Box3().setFromObject(object);

    // Extract bbox corners
    const corners = [
        new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z),
        new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.min.z),
        new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.min.z),
        new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.min.z),
        new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.max.z),
        new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.max.z),
        new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.max.z),
        new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.max.z),
    ];

    // 1) Transform corners to world space
    // 2) Project corners to screen space
    const screenXCoordinates = corners.map(corner => {

        // to worldspace
        corner.applyMatrix4(object.matrixWorld)

        // to NDC space
        corner.project(camera)
        const ndc =  (corner.x * 0.5 + 0.5) * window.innerWidth

        return ndc
    })

    // Find the span of the X-coordinates in screen space
    const screenMinX = Math.min(...screenXCoordinates);
    const screenMaxX = Math.max(...screenXCoordinates);

    // Return the screen-space width
    return screenMaxX - screenMinX;
}

// Update Scale Bar
function updateScaleBar() {
    const scaleBar = document.getElementById('scale-bar');
    const screenWidth = calculateScreenProjectedWidth(mesh, camera);

    scaleBar.style.width = `${screenWidth}px`;
    scaleBar.textContent = `Scale: ${mesh.geometry.parameters.width} units`;
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Update the scale bar dynamically
    updateScaleBar();

    renderer.render(scene, camera);
}

animate();
