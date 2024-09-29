import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
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

const highCutoff = 0.73;
const medCutoff = 0.5;

function Buildings({grid} : {grid: GridGenerator}): React.ReactNode {
    const { scene } = useThree();

    useEffect(() => {
        const radius = (grid.hexagonSideLen - 1) * grid.unitLen;
        const num = Math.pow(radius,2) * 2000;
        const batched = new THREE.BatchedMesh(num * 10, num * 10 * 216);


        const towerId = batched.addGeometry(new THREE.BoxGeometry(0.05, 0.2, 0.05));
        const houseId = batched.addGeometry(new THREE.BoxGeometry(0.03, 0.05, 0.03));
        const treeId1 = batched.addGeometry(new THREE.ConeGeometry(0.018, 0.06));
        const treeId2 = batched.addGeometry(new THREE.ConeGeometry(0.025, 0.1));

        for (let i = 0; i < num; i++) {
            const u = Math.random() * (radius - 0.05);
            const v = Math.random() * (radius - 0.05);
            let x = 0,
                y = 0;

            if (i < num / 3) {
                x = u - 0.5 * v;
                y = 0.866 * v;
            } else if (i < (2 * num) / 3) {
                x = u - 0.5 * v;
                y = -0.866 * v;
            } else {
                x = -0.5 * v - 0.5 * u;
                y = 0.866 * v - 0.866 * u;
            }

            let ii = 0;
            const noise = GameState.perlinPopulation.getNormalizedNoise(x, y, 0, 1);
            if (noise > highCutoff) {
                if (Math.random() > noise) continue;
                else ii = batched.addInstance(towerId);

                let scale = (noise - highCutoff) / (1 - highCutoff) + 0.5;
                if (Math.random() > 0.9) scale *= 2.0;

                const yo = scale * 0.2 / 2;
                batched.setMatrixAt(
                    ii,
                    new THREE.Matrix4().compose(
                        new THREE.Vector3(x, yo, y),
                        new THREE.Quaternion(),
                        new THREE.Vector3(Math.random() * 0.2 + 0.9, scale, Math.random() * 0.2 + 0.9),
                    ),
                );
            } else if (noise > medCutoff) {
                if (Math.random() > noise - 0.23) {
                    if (Math.random() < 0.3) ii = batched.addInstance(treeId1);
                    else continue;
                }
                else ii = batched.addInstance(houseId);

                batched.setMatrixAt(
                    ii,
                    new THREE.Matrix4().compose(
                        new THREE.Vector3(x, 0, y),
                        new THREE.Quaternion(),
                        new THREE.Vector3(Math.random() * 0.2 + 0.9, Math.random() * 0.6 + 0.8, Math.random() * 0.2 + 0.9),
                    ),
                );
            } else {
                if (noise > 0.3 && Math.random() < 0.95) continue;
                const cluster = Math.random() * 5;
                for (let j = 0; j < cluster; j++) {
                    if (Math.random() < 0.3) ii = batched.addInstance(treeId2);
                    else ii = batched.addInstance(treeId1);
                    const xo = Math.random() * 0.1 - 0.05;
                    const yo = Math.random() * 0.1 - 0.05;

                    batched.setMatrixAt(
                        ii,
                        new THREE.Matrix4().compose(
                            new THREE.Vector3(x + xo, 0, y + yo),
                            new THREE.Quaternion(),
                            new THREE.Vector3(1, Math.random() * 0.3 + 1.0, 1),
                        ),
                    );
                }
            }
        }
        const mat = new THREE.MeshStandardMaterial();
        mat.color = new THREE.Color(0.1, 0.15, 0.15);
        batched.material = mat;
        scene.add(batched);
        return () => {
            scene.remove(batched);
        }
    }, [grid, scene]);

    return <></>;
}

export default function GridCanvas({
    grid,
    gameState,
    setDistrictInfo,
    money,
    setMoney,
}: {
    grid: GridGenerator;
    gameState: GameState;
    setDistrictInfo: (val: number[]) => void;
    money: number,
    setMoney: (fn: ((val: number) => number)) => void;
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
        // console.log("set cat supps to " + (val == null ? -1 : val));
        currentSelection.current = val;
        if (val != null) {
            const cell = gameState.cells[val];
            const POPULATION_SCALE = 10000;
            setDistrictInfo([
                ~~(cell.truePopulation * POPULATION_SCALE / 100) * 100,
                Math.round(cell.voterProportion * 100),
                Math.round((1 - cell.voterProportion) * 100),
            ]);
            // console.log("setting info");
        }
        if (currentSelection.current != null && mouseDown.current) {
            if (gameState.actionMode == "redistricting" && startingSelection.current! <= gameState.maxDistricts) {
                gameState.addCellToDistrict(
                    currentSelection.current,
                    startingSelection.current,
                );
                gameState.updateSusness();
            }
            setRenderCount(renderCount + 1);
        }
        // console.log(val);
    }
    function setStartingSelection(val: number) {
        if (gameState.actionMode == "redistricting") {
            const district = gameState.cells[val].district;
            // console.log("District for index " + val + " is " + district);
            if (district == null) {
                // console.log("set starting selection to new dist");
                startingSelection.current = gameState.numDistricts + 1;
            } else {
                // console.log("set starting selection to existing dist " + console.log(gameState.cells[val].district))
                startingSelection.current = district;
            }
        } else {
            if (money >= 10) {
                setMoney((e: number) => e - 10);
                gameState.campaignInCell(val);
            }
        }
    }
    function setMouseDown(val: boolean) {
        mouseDown.current = val;
    }

    const buildingsComp = useMemo(() => (
        <Buildings
            grid={grid}
        />
    ), [grid]);

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
        Array.from(grid.dcel.faces.values()).forEach((_, i) => {
            mp.set(i, Math.random() * 0xffffff);
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
        <Canvas
            onPointerOut={() => setCurrentSelection(null)}
        >
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

            {buildingsComp}

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
                        // actionMode={gameState.actionMode}
                    />
                );
            })}
        </Canvas>
    );
}
