import * as THREE from "three"
import ConvexHull from "./convexHull.js"

class SphereCluster {

    constructor(radius, count) {

        const sphereGeometry = new THREE.SphereGeometry(radius, 16, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, wireframe: true })

        this.mesh = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, count);

        // Add random transformations to each instance
        const matrix4 = new THREE.Matrix4();
        const displacement = 4
        for (let i = 0; i < count; i++) {
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

            matrix4.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
            this.mesh.setMatrixAt(i, matrix4);
        }

        this.positionArray = getPositionArray(this.mesh)

        this.hull = new ConvexHull(this.positionArray)

    }
}

function getPositionArray(mesh) {

    const geometry = mesh.geometry; // Canonical sphere geometry
    const baseVertices = geometry.attributes.position.array; // Base sphere vertices

    const matrix = new THREE.Matrix4();
    const vertex = new THREE.Vector3();

    const aggregateVertices = []; // Store all transformed vertices
    for (let i = 0; i < mesh.count; i++) {

        // Get the transformation matrix for the current instance
        mesh.getMatrixAt(i, matrix);

        // Transform canonical sphere vertices
        for (let j = 0; j < baseVertices.length; j += 3) {

            vertex.set(baseVertices[j], baseVertices[j + 1], baseVertices[j + 2]);
            vertex.applyMatrix4(matrix);

            aggregateVertices.push(vertex.x, vertex.y, vertex.z);
        }
    }

    return aggregateVertices;
}

export default SphereCluster
