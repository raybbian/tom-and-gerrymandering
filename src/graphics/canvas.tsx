import { Canvas } from "@react-three/fiber";
import { GridGenerator } from "@/scripts/grid";
import { Line } from "@react-three/drei";

export default function GridCanvas({ grid }: { grid: GridGenerator }) {
    return (
        <Canvas>
            <ambientLight intensity={Math.PI / 2} />
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
                        [...halfEdge.a.pos, 0],
                        [...halfEdge.b.pos, 0],
                    ]}
                />
            ))}
        </Canvas>
    );
}
