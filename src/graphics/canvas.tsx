import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { GridGenerator } from "@/scripts/grid";
import { CameraControls, Line, Sphere, Stats } from "@react-three/drei";
import { GridSpace } from "./grid_space";

export default function GridCanvas({ grid }: { grid: GridGenerator }) {
    return (
        <Canvas>
            <ambientLight intensity={Math.PI / 2} />
            <CameraControls
                minDistance={2}
                maxDistance={5}
                minPolarAngle={0}
                maxPolarAngle={(2 * Math.PI) / 5}
                // minAzimuthAngle={0}
                // maxAzimuthAngle={0}
            />
            <Stats />
            <spotLight
                position={[10, 10, 10]}
                angle={0.15}
                penumbra={1}
                decay={0}
                intensity={Math.PI}
            />
            <pointLight
                position={[-10, -10, -10]}
                decay={0}
                intensity={Math.PI}
            />

            {Array.from(grid.dcel.halfEdges.values()).map((halfEdge, i) => (
                <Line
                    key={i}
                    points={[
                        [halfEdge.a.pos[0], 0, halfEdge.a.pos[1]],
                        [halfEdge.b.pos[0], 0, halfEdge.b.pos[1]],
                    ]}
                />
            ))}
            {false &&
                Array.from(grid.dcel.points.values()).map((point, i) => (
                    <Sphere
                        args={[0.02]}
                        key={i}
                        position={[...point.pos, 0]}
                    />
                ))}
            {Array.from(grid.dcel.faces.values()).map((face, i) => {
                if (face.isExterior) return;
                const pointList = face.pointList();
                return (
                    <GridSpace
                        points={[
                            ...pointList.map(
                                (point) =>
                                    new THREE.Vector3(
                                        point.pos[0],
                                        -0.1,
                                        point.pos[1],
                                    ),
                            ),
                            ...pointList.map(
                                (point) =>
                                    new THREE.Vector3(
                                        point.pos[0],
                                        -0.0001,
                                        point.pos[1],
                                    ),
                            ),
                        ]}
                        key={i}
                    />
                );
            })}
        </Canvas>
    );
}
