import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {vectorMax, vectorMin} from "./utils.js"

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
//     geometry = new THREE.BoxGeometry(3, 1, 2);
//     material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
//     mesh = new THREE.Mesh(geometry, material);

// Twisted Torus
    geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16); // Customize as needed
    material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    mesh = new THREE.Mesh(geometry, material);

// Ellipsoid
//     geometry = new THREE.SphereGeometry(1, 32, 32)
//     material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
//     mesh = new THREE.Mesh(geometry, material)
//     mesh.scale.set(2, 0.5, 1.5)

// Ellipsoid
//     geometry = new THREE.SphereGeometry(1, 32, 32)
//     material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
//     mesh = new THREE.Mesh(geometry, material)
//     mesh.scale.set(2, 0.5, 1.5)

// Plane
// const planeWidth = 1; // World units
// const planeHeight = 1; // World units
// geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
// material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
// mesh = new THREE.Mesh(geometry, material);
//
// // Position and orient the plane to align with the viewing frustum
// mesh.position.z = -camera.near; // Align with the near plane

    // const bboxHelper = new THREE.BoxHelper(mesh, 0xff0000)
    // scene.add(bboxHelper)
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

function updateScaleBar(mesh) {
    const bounds = calculateTightFittingBounds(mesh, camera);

    // Horizontal (X-axis) scale bar
    const horizontalScaleBar = document.getElementById('horizontal-scale-bar');
    horizontalScaleBar.style.left = `${ bounds.west}px`;
    horizontalScaleBar.style.top = `${bounds.north + 32}px`;
    horizontalScaleBar.style.width = `${bounds.width}px`;
    horizontalScaleBar.textContent = `${bounds.widthNM.toFixed(2)} nm`;

    // Vertical (Y-axis) scale bar
    const verticalScaleBar = document.getElementById('vertical-scale-bar');
    verticalScaleBar.style.left = `${bounds.west - 64}px`;
    verticalScaleBar.style.top = `${bounds.south}px`;
    verticalScaleBar.style.height = `${bounds.height}px`;

    // Update text inside the vertical scale bar
    const verticalLabel = verticalScaleBar.querySelector('span');
    verticalLabel.textContent = `${bounds.heightNM.toFixed(2)} nm`;
}

function ___updateScaleBar(mesh) {

    const { width, height, widthNM, heightNM } = calculateTightFittingBounds(mesh, camera);

    // horizontal scale bar
    const horizontalScaleBar = document.getElementById('horizontal-scale-bar');
    horizontalScaleBar.style.width = `${width}px`;
    horizontalScaleBar.textContent = `${ widthNM.toFixed(2) } nm`;

    // vertical scale bar
    const verticalScaleBar = document.getElementById('vertical-scale-bar');
    verticalScaleBar.style.width = `${height}px`;
    verticalScaleBar.textContent = `${ heightNM.toFixed(2) } nm`;
}

function calculateTightFittingBounds(object, camera) {

    const vertices = object.geometry.attributes.position.array;

    let xyzCameraMin = new THREE.Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)
    let xyzCameraMax = new THREE.Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY)

    let ndcMin = new THREE.Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)
    let ndcMax = new THREE.Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY)

    for (let i = 0; i < vertices.length; i += 3) {

        // Object space
        const vertex = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2])

        // Camera space
        const xyzCamera = vertex.clone().applyMatrix4(camera.matrixWorldInverse)
        xyzCameraMin = vectorMin(xyzCameraMin, xyzCamera)
        xyzCameraMax = vectorMax(xyzCameraMax, xyzCamera)

        // World space
        const xyzWorld = vertex.clone().applyMatrix4(object.matrixWorld)

        // NDC space
        const ndc = xyzWorld.clone().project(camera)
        ndcMin = vectorMin(ndcMin, ndc)
        ndcMax = vectorMax(ndcMax, ndc)

    }

    // ndc: convert to 0 -> 1
    const ndcMin01X = 0.5 * ndcMin.x + 0.5
    const ndcMax01X = 0.5 * ndcMax.x + 0.5

    // ndc: y-axis is flipped
    const ndcMax01Y = -0.5 * ndcMin.y + 0.5
    const ndcMin01Y = -0.5 * ndcMax.y + 0.5

    // camera space extent (world space distances)
    const widthNM = xyzCameraMax.x - xyzCameraMin.x
    const heightNM = xyzCameraMax.y - xyzCameraMin.y

    const south = ndcMin01Y * window.innerHeight
    const north = ndcMax01Y * window.innerHeight

    const west = ndcMin01X * window.innerWidth
    const east = ndcMax01X * window.innerWidth

    const width =  east - west
    const height = north - south

    return { north, south, east, west, width, height, widthNM, heightNM }

}

function calculateScreenProjectedDimensions(object, camera) {

    const bbox = new THREE.Box3().setFromObject(object);

    const bbox_vertices =
        [
            new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z),
            new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.min.z),
            new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.min.z),
            new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.min.z),
            new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.max.z),
            new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.max.z),
            new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.max.z),
            new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.max.z),
        ];

    // Transform and project corners
    const coords = bbox_vertices.map(corner => {

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
    const minX = Math.min(...coords.map(({xyzCamera}) => xyzCamera.x))
    const maxX = Math.max(...coords.map(({xyzCamera}) => xyzCamera.x))
    const minY = Math.min(...coords.map(({xyzCamera}) => xyzCamera.y))
    const maxY = Math.max(...coords.map(({xyzCamera}) => xyzCamera.y))

    // screen scale min/max
    const screenMinX = Math.min(...coords.map(({x}) => x))
    const screenMaxX = Math.max(...coords.map(({x}) => x))
    const screenMinY = Math.min(...coords.map(({y}) => y))
    const screenMaxY = Math.max(...coords.map(({y}) => y))

    return {
        width: screenMaxX - screenMinX,
        height: screenMaxY - screenMinY,
        w: maxX - minX,
        h: maxY - minY,
    };
}

