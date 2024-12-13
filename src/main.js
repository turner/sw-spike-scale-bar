import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { QuickHull } from 'quickhull3d';
import {vectorMax, vectorMin} from "./utils.js"

let scene
let camera
let renderer
let controls
let geometry
let material
let mesh

document.addEventListener("DOMContentLoaded", async (event) => {

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xffffff)

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);

// Twisted Torus
    geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16); // Customize as needed
    material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, wireframe: true });
    mesh = new THREE.Mesh(geometry, material);
    // scene.add(mesh)

    // Pointcloud generation
    const numInteriorPoints = 5000; // Adjust for density
    const interiorPoints = [];
    const positions = geometry.attributes.position.array;

    for (let i = 0; i < numInteriorPoints; i++) {
        // Pick a random vertex from the original geometry
        const idx = Math.floor(Math.random() * (positions.length / 3)) * 3;
        const baseX = positions[idx];
        const baseY = positions[idx + 1];
        const baseZ = positions[idx + 2];

        // Add a small random offset to fill the interior
        const offsetX = (Math.random() - 0.5) * 0.2; // Adjust multiplier for spread
        const offsetY = (Math.random() - 0.5) * 0.2;
        const offsetZ = (Math.random() - 0.5) * 0.2;

        interiorPoints.push([ baseX + offsetX, baseY + offsetY, baseZ + offsetZ ]);
    }

    // Create the point cloud for the interior
    const pointCloudGeometry = new THREE.BufferGeometry()
    pointCloudGeometry.setAttribute('position', new THREE.Float32BufferAttribute(interiorPoints.flat(), 3))

    const pointMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 0.05 });
    // const pointCloud = new THREE.Points(pointCloudGeometry, pointMaterial);
    // scene.add(pointCloud);

    const list = pointCloudGeometry.attributes.position.array;
    const cloudPoints = list.reduce((acc, _, i) => {
        if (i % 3 === 0) {
            acc.push([list[i], list[i + 1], list[i + 2]]);
        }
        return acc;
    }, []);




    // Create a canonical sphere geometry
    const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, wireframe: true })

    // Create an InstancedMesh for the spheres
    const numSpheres = 16;
    const sphereMesh = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, numSpheres);

    // Add random transformations to each instance
    const tempMatrix = new THREE.Matrix4();
    const displacement = 4
    for (let i = 0; i < numSpheres; i++) {
        const position = new THREE.Vector3(
            (Math.random() - 0.5) * displacement, // Random X position
            (Math.random() - 0.5) * displacement, // Random Y position
            (Math.random() - 0.5) * displacement  // Random Z position
        );

        const rotation = new THREE.Euler(
            Math.random() * Math.PI, // Random rotation around X
            Math.random() * Math.PI, // Random rotation around Y
            Math.random() * Math.PI  // Random rotation around Z
        );

        // const scale = new THREE.Vector3(
        //     0.5 + Math.random(), // Random scale X
        //     0.5 + Math.random(), // Random scale Y
        //     0.5 + Math.random()  // Random scale Z
        // );

        const scale = new THREE.Vector3(1,1,1);

        tempMatrix.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
        sphereMesh.setMatrixAt(i, tempMatrix);
    }

    // Add the InstancedMesh to the scene
    scene.add(sphereMesh);










    // Convex Hull
    const hull = new QuickHull(cloudPoints)
    // const hull = new QuickHull(interiorPoints)
    hull.build()

    // Create mesh from hull
    const hullFaces = hull.collectFaces()
    const hullXYZ = [];
    const hullIndices = [];
    for (const [a, b, c]  of hullFaces) {

        let index = hullXYZ.length/3
        hullIndices.push(index, ++index, ++index)

        const [ aa, bb, cc ] = [ hull.vertices[ a ].point, hull.vertices[ b ].point, hull.vertices[ c ].point ]

        hullXYZ.push(...aa, ...bb, ...cc)
    }

    const hullGeometry = new THREE.BufferGeometry()
    hullGeometry.setAttribute('position', new THREE.Float32BufferAttribute(hullXYZ, 3))
    hullGeometry.setIndex(hullIndices)

    const hullMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
    const hullMesh = new THREE.Mesh(hullGeometry,  hullMaterial)

    // scene.add(hullMesh)






    const bboxHelper = new THREE.BoxHelper(sphereMesh, 0xff0000)
    scene.add(bboxHelper)






    animate();

})

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})

function animate() {
    requestAnimationFrame(animate)

    // const bounds = calculateTightFittingBounds(mesh, camera)
    // updateScaleBars(bounds)

    renderer.render(scene, camera)
}

function updateScaleBars(bounds) {
    // Horizontal Scale Bar
    const horizontalContainer = document.getElementById('horizontal-scale-bar-container');
    const horizontalSVG = document.getElementById('horizontal-scale-bar-svg');
    const horizontalBar = document.getElementById('horizontal-scale-bar');
    const horizontalLabel = document.getElementById('horizontal-scale-bar-label');

    // Position the horizontal scale bar container
    horizontalContainer.style.left = `${bounds.west}px`;
    horizontalContainer.style.top = `${bounds.north + 20}px`; // Offset slightly above the object

    // Update SVG dimensions and viewBox
    horizontalSVG.setAttribute('width', `${bounds.width}px`);
    horizontalSVG.setAttribute('viewBox', `0 0 ${bounds.width} 38`);

    // Update rect dimensions explicitly
    horizontalBar.setAttribute('width', `${bounds.width}`);
    horizontalBar.setAttribute('height', `5`); // Fixed bar height

    // Update label text
    horizontalLabel.textContent = `${bounds.widthNM.toFixed(2)} nm`;

    // Vertical Scale Bar
    const verticalContainer = document.getElementById('vertical-scale-bar-container');
    const verticalSVG = document.getElementById('vertical-scale-bar-svg');
    const verticalBar = document.getElementById('vertical-scale-bar');
    const verticalLabel = document.getElementById('vertical-scale-bar-label');

    // Position the vertical scale bar container
    verticalContainer.style.left = `${bounds.west - 38}px`; // Position to the left of the data
    verticalContainer.style.top = `${bounds.south}px`;

    // Update SVG dimensions and viewBox
    verticalSVG.setAttribute('height', `${bounds.height}px`);
    verticalSVG.setAttribute('viewBox', `0 0 38 ${bounds.height}`);

    // Update rect dimensions explicitly
    verticalBar.setAttribute('width', `5`); // Fixed bar width
    verticalBar.setAttribute('height', `${bounds.height}`);

    // Calculate the midpoint of the bar
    const labelY = bounds.height / 2;

    // Update label positioning
    verticalLabel.setAttribute('y', `${labelY}`);
    verticalLabel.setAttribute('transform', `rotate(-90, 18, ${labelY})`);
    verticalLabel.textContent = `${bounds.heightNM.toFixed(2)} nm`;
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
