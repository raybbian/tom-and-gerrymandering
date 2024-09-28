import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { GridGenerator } from "@/scripts/grid";
import {
    CameraControls,
    Line,
    PerspectiveCamera,
    Sphere,
    Stats,
} from "@react-three/drei";
import { GridSpace } from "./grid_space";
import { GameState } from "@/scripts/game_state";
import { useRef } from "react";

export default function GridCanvas({
    grid,
    gameState,
}: {
    grid: GridGenerator;
    gameState: GameState;
}) {
    const currentSelection = useRef<number | null>(null);
    // null if selected has no district, otherwise district number
    const startingSelection = useRef<number | null>(null);
    function setCurrentSelection(val: number | null) {
        currentSelection.current = val;
        if (currentSelection.current != null && mouseDown.current) {
            console.log(startingSelection.current);
            gameState.addCellToDistrict(
                currentSelection.current,
                startingSelection.current,
            );
        }
        // console.log(val);
    }
    function setStartingSelection(val: number) {
        const district = gameState.cells[val].district;
        if (district == null) {
            console.log("set starting selection to new dist");
            startingSelection.current = gameState.numDistricts + 1;
        } else {
            // console.log("set starting selection to existing dist " + console.log(gameState.cells[val].district))
            startingSelection.current = district;
        }
    }
    const mouseDown = useRef<boolean>(false);
    function setMouseDown(val: boolean) {
        mouseDown.current = val;
    }
    return (
        <Canvas>
            <ambientLight intensity={Math.PI / 2} />
            <CameraControls
                minPolarAngle={0}
                maxPolarAngle={(2 * Math.PI) / 5}
                minDistance={1}
                maxDistance={5}
                onStart={(e) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    // NOTE: e.target should be the cameracontrols instance but sometimes it wasn't, but its working now so let Raymond know if the camera bounding boxes braek
                    e.target.setBoundary(
                        // type: i
                        new THREE.Box3(
                            new THREE.Vector3(-1, 0, -1),
                            new THREE.Vector3(1, 0.5, 1),
                        ),
                    );
                }}
            />
            <PerspectiveCamera makeDefault position={[0, 5, 0]} />
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
                        currentSelection={currentSelection.current}
                        setCurrentSelection={setCurrentSelection}
                        setMouseDown={setMouseDown}
                        setStartingSelection={setStartingSelection}
                        index={i}
                        key={i}
                    />
                );
            })}
        </Canvas>
    );
}
