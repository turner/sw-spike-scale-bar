import * as THREE from "three"
import ConvexHull from "./convexHull.js"

class TwistedTorusPointcloud {

    constructor(twistedTorusPositions, numInteriorPoints) {

        const interiorPoints = []
        for (let i = 0; i < numInteriorPoints; i++) {

            const idx = Math.floor(Math.random() * (twistedTorusPositions.length / 3)) * 3;
            const baseX = twistedTorusPositions[idx];
            const baseY = twistedTorusPositions[idx + 1];
            const baseZ = twistedTorusPositions[idx + 2];

            const offsetX = (Math.random() - 0.5) * 0.2;
            const offsetY = (Math.random() - 0.5) * 0.2;
            const offsetZ = (Math.random() - 0.5) * 0.2;

            interiorPoints.push([ baseX + offsetX, baseY + offsetY, baseZ + offsetZ ]);
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(interiorPoints.flat(), 3))

        const material = new THREE.PointsMaterial({ color: 0xff0000, size: 0.05 })

        this.mesh = new THREE.Points(geometry, material)

        this.hull = new ConvexHull(this.mesh.geometry.attributes.position.array)

    }

}

export default TwistedTorusPointcloud
