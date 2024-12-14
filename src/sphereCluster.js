import * as THREE from "three"

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

    }
}

export default SphereCluster
