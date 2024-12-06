import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {min} from "three/tsl"

let scene
let camera
let renderer
let controls
let geometry
let material
let mesh

document.addEventListener("DOMContentLoaded", async (event) => {

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);

// Box
    geometry = new THREE.BoxGeometry(3, 1, 2);
    material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    mesh = new THREE.Mesh(geometry, material);

// Twisted Torus
//     geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16); // Customize as needed
//     material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
//     mesh = new THREE.Mesh(geometry, material);

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

    animate();

})

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})

function animate() {

    requestAnimationFrame(animate)

    updateScaleBar(mesh)

    renderer.render(scene, camera)
}

function calculateScreenProjectedDimensions(object, camera) {

    const box = new THREE.Box3().setFromObject(object);

    // Define corners of the bounding box
    const corners =
        [
        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
        new THREE.Vector3(box.min.x, box.max.y, box.min.z),
        new THREE.Vector3(box.max.x, box.min.y, box.min.z),
        new THREE.Vector3(box.max.x, box.max.y, box.min.z),
        new THREE.Vector3(box.min.x, box.min.y, box.max.z),
        new THREE.Vector3(box.min.x, box.max.y, box.max.z),
        new THREE.Vector3(box.max.x, box.min.y, box.max.z),
        new THREE.Vector3(box.max.x, box.max.y, box.max.z),
    ];

    // Transform and project corners
    const screenCoordinates = corners.map(corner => {

        // Camera space
        const xyzCamera = corner.clone().applyMatrix4(camera.matrixWorldInverse)

        // World space
        const xyzWorld = corner.clone().applyMatrix4(object.matrixWorld)

        // NDC space
        const ndc = xyzWorld.clone().project(camera)

        const result =
            {
                x: (ndc.x * 0.5 + 0.5) * window.innerWidth,

                // Flip Y to match screen space
                y: (ndc.y * -0.5 + 0.5) * window.innerHeight,

                xyzWorld,

                xyzCamera
            };

        return result
    });

    // xyzCamera min/max
    const minX = Math.min(...screenCoordinates.map(({xyzCamera}) => xyzCamera.x))
    const maxX = Math.max(...screenCoordinates.map(({xyzCamera}) => xyzCamera.x))
    const minY = Math.min(...screenCoordinates.map(({xyzCamera}) => xyzCamera.y))
    const maxY = Math.max(...screenCoordinates.map(({xyzCamera}) => xyzCamera.y))

    // screen scale min/max
    const screenMinX = Math.min(...screenCoordinates.map(({x}) => x))
    const screenMaxX = Math.max(...screenCoordinates.map(({x}) => x))
    const screenMinY = Math.min(...screenCoordinates.map(({y}) => y))
    const screenMaxY = Math.max(...screenCoordinates.map(({y}) => y))

    return {
        width: screenMaxX - screenMinX,
        height: screenMaxY - screenMinY,
        w: maxX - minX,
        h: maxY - minY,
    };
}

function updateScaleBar(mesh) {
    const { width, height, w, h } = calculateScreenProjectedDimensions(mesh, camera);

    // Update horizontal scale bar
    const horizontalScaleBar = document.getElementById('scale-bar');
    horizontalScaleBar.style.width = `${width}px`;
    horizontalScaleBar.textContent = `${ w.toFixed(2) } nm`;

    // Update vertical scale bar
    const verticalScaleBar = document.getElementById('vertical-scale-bar');
    verticalScaleBar.style.height = `${height}px`;
    verticalScaleBar.textContent = `${ h.toFixed(2) } nm`;
}

