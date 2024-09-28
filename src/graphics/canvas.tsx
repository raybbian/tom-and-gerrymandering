import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
    exteriorHEOfFaces,
    Face,
    GridGenerator,
    HalfEdge,
} from "@/scripts/grid";
import {
    CameraControls,
    Line,
    PerspectiveCamera,
    Stats,
} from "@react-three/drei";
import { GridSpace } from "./grid_space";
import { GameState } from "@/scripts/game_state";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    determineDistrictSusness,
    validateBadDistricts,
} from "@/scripts/district";

export default function GridCanvas({
    grid,
    gameState,
}: {
    grid: GridGenerator;
    gameState: GameState;
}) {
    console.log("Canvas re-render?");

    const currentSelection = useRef<number | null>(null);
    // null if selected has no district, otherwise district number
    const startingSelection = useRef<number | null>(null);

    const mouseDown = useRef<boolean>(false);

    /**
     * Use to toggle a render after modifying ref
     */
    const [renderCount, setRenderCount] = useState(0);

    function setCurrentSelection(val: number | null) {
        currentSelection.current = val;
        if (currentSelection.current != null && mouseDown.current) {
            // console.log(startingSelection.current);
            gameState.addCellToDistrict(
                currentSelection.current,
                startingSelection.current,
            );
            setRenderCount(renderCount + 1);
        }
        // console.log(val);
    }
    function setStartingSelection(val: number) {
        const district = gameState.cells[val].district;
        if (district == null) {
            // console.log("set starting selection to new dist");
            startingSelection.current = gameState.numDistricts + 1;
        } else {
            // console.log("set starting selection to existing dist " + console.log(gameState.cells[val].district))
            startingSelection.current = district;
        }
    }
    function setMouseDown(val: boolean) {
        mouseDown.current = val;
    }

    const borderLines = useMemo(() => {
        const mp: Map<HalfEdge, [THREE.Vector3, THREE.Vector3]> = new Map();
        grid.dcel.halfEdges.forEach((he) => {
            if (mp.has(he) || mp.has(he.twin)) {
                return;
            }
            const linePoints: [THREE.Vector3, THREE.Vector3] = [
                new THREE.Vector3(he.a.pos[0], 0, he.a.pos[1]),
                new THREE.Vector3(he.b.pos[0], 0, he.b.pos[1]),
            ];
            mp.set(he, linePoints);
            mp.set(he.twin, linePoints);
        });
        return mp;
    }, [grid]);

    const gridPrisms = useMemo(() => {
        const mp: Map<Face, THREE.Vector3[]> = new Map();
        grid.dcel.faces.forEach((face) => {
            const pointList = face.pointList();
            mp.set(face, [
                ...pointList.map(
                    (point) =>
                        new THREE.Vector3(point.pos[0], -0.1, point.pos[1]),
                ),
                ...pointList.map(
                    (point) =>
                        new THREE.Vector3(point.pos[0], -0.0001, point.pos[1]),
                ),
            ]);
        });
        return mp;
    }, [grid]);

    const districtColors = useMemo(() => {
        const mp: Map<number, number> = new Map();
        grid.dcel.faces.values().forEach((i, _) => {
            mp.set(_, Math.random() * 0xffffff);
        });
        return mp;
    }, [grid]);

    /**
     * use this ref to programatically control the camera
     */
    const cameraControlRef = useRef<CameraControls | null>(null);

    //init the camera boundary
    useEffect(() => {
        const controls = cameraControlRef.current;
        if (controls == null) return;
        controls.setBoundary(
            new THREE.Box3(
                new THREE.Vector3(-1, 0, -1),
                new THREE.Vector3(1, 0.5, 1),
            ),
        );
    }, []);

    return (
        <Canvas>
            <ambientLight intensity={Math.PI / 2} />
            <CameraControls
                ref={cameraControlRef}
                minPolarAngle={0}
                maxPolarAngle={(2 * Math.PI) / 5}
                minDistance={1}
                maxDistance={5}
                mouseButtons={{
                    left: 0, //Action.NONE
                    middle: 2, //Action.TRUCK
                    wheel: 8, //Action.DOLLY
                    right: 1, //Action.ROTATE
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

            {Array.from(gameState.districts.entries()).map(
                ([districtInd, districtSet]) => {
                    if (districtSet.size == 0) return;
                    const faces = Array.from(districtSet).map(
                        (cellInd) => gameState.cells[cellInd].dcelFace,
                    );
                    const shell = exteriorHEOfFaces(faces);
                    return shell.map((he, i) => {
                        return (
                            <Line
                                key={i}
                                points={borderLines.get(he)!}
                                color={districtColors.get(districtInd)}
                            />
                        );
                    });
                },
            )}
            {Array.from(grid.dcel.faces.values()).map((face, i) => {
                if (face.isExterior) return;
                return (
                    <GridSpace
                        points={gridPrisms.get(face)!}
                        currentSelection={currentSelection.current}
                        setCurrentSelection={setCurrentSelection}
                        setMouseDown={setMouseDown}
                        setStartingSelection={setStartingSelection}
                        index={i}
                        key={i}
                        proportion={gameState.cells[i].voterProportion}
                        population={gameState.cells[i].truePopulation}
                    />
                );
            })}
        </Canvas>
    );
}
