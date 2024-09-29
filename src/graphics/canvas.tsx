import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
    exteriorHEOfFaces,
    Face,
    GridGenerator,
    HalfEdge,
} from "@/scripts/grid";
import { CameraControls, PerspectiveCamera, Stats, Sky } from "@react-three/drei";
import { GridSpace } from "./grid_space";
import { GameState } from "@/scripts/game_state";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ConvexGeometry } from "three/examples/jsm/Addons.js";
import { PerlinNoise } from "@/scripts/perlin";
import { Water, Water2 } from "three-stdlib";

const highCutoff = 0.73;
const medCutoff = 0.5;

function Buildings({
    grid,
    perlin,
}: {
    grid: GridGenerator;
    perlin: PerlinNoise;
}): React.ReactNode {
    const { scene } = useThree();

    useEffect(() => {
        const radius = (grid.hexagonSideLen - 1) * grid.unitLen;
        const num = Math.pow(radius, 2) * 2000;
        const batched = new THREE.BatchedMesh(num * 10, num * 10 * 216);

        const towerId = batched.addGeometry(
            new THREE.BoxGeometry(0.05, 0.2, 0.05),
        );
        const houseId = batched.addGeometry(
            new THREE.BoxGeometry(0.03, 0.05, 0.03),
        );
        const treeId1 = batched.addGeometry(
            new THREE.ConeGeometry(0.018, 0.06),
        );
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
            const noise = perlin.getNormalizedNoise(x, y, 0, 1);
            if (noise > highCutoff) {
                if (Math.random() > noise) continue;
                else ii = batched.addInstance(towerId);

                let scale = (noise - highCutoff) / (1 - highCutoff) + 0.5;
                if (Math.random() > 0.9) scale *= 2.0;

                const yo = (scale * 0.2) / 2;
                batched.setMatrixAt(
                    ii,
                    new THREE.Matrix4().compose(
                        new THREE.Vector3(x, yo, y),
                        new THREE.Quaternion(),
                        new THREE.Vector3(
                            Math.random() * 0.2 + 0.9,
                            scale,
                            Math.random() * 0.2 + 0.9,
                        ),
                    ),
                );
            } else if (noise > medCutoff) {
                if (Math.random() > noise - 0.23) {
                    if (Math.random() < 0.3) ii = batched.addInstance(treeId1);
                    else continue;
                } else ii = batched.addInstance(houseId);

                batched.setMatrixAt(
                    ii,
                    new THREE.Matrix4().compose(
                        new THREE.Vector3(x, 0, y),
                        new THREE.Quaternion(),
                        new THREE.Vector3(
                            Math.random() * 0.2 + 0.9,
                            Math.random() * 0.6 + 0.8,
                            Math.random() * 0.2 + 0.9,
                        ),
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
        const mat = new THREE.MeshStandardMaterial({
            opacity: 0.5,
            transparent: true,
        });
        mat.color = new THREE.Color(1, 1, 1);
        batched.material = mat;
        scene.add(batched);
        return () => {
            scene.remove(batched);
        };
    }, [grid, scene, perlin]);

    return <></>;
}

function Ocean() {
    const ref = useRef<Water | null>(null);
    const { scene } = useThree();
    const waterNormals = useLoader(THREE.TextureLoader, '/waternormals.jpeg');
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
    useEffect(() => {
        const plane = new THREE.PlaneGeometry(1000, 1000);
        plane.rotateX(-Math.PI / 2);
        plane.translate(0, -.1, 0);
        ref.current = new Water(plane,
            ({
                textureWidth: 512,
                textureHeight: 512,
                waterNormals,
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: false,
            }),
        );
        scene.add(ref.current);
    }, [scene, waterNormals]);
    useFrame((_, delta) => {
        console.log(ref.current)
        if (ref.current == null) return;
        ref.current.material.uniforms.time.value += delta / 10.
    });
    return <></>
}

export default function GridCanvas({
    grid,
    gameState,
    setDistrictInfo,
    money,
    setMoney,
    rerenderGrid,
}: {
    grid: GridGenerator;
    gameState: GameState;
    setDistrictInfo: (val: number[]) => void;
    money: number;
    setMoney: (fn: (val: number) => number) => void;
    rerenderGrid: number;
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

    function removeCellFromDistrict(val: number) {
        console.log("removing " + val);
        gameState.removeCellFromDistrict(currentSelection.current!);
        setRenderCount((e) => e + 1);
    }

    function setCurrentSelection(val: number | null) {
        // console.log("set cat supps to " + (val == null ? -1 : val));
        currentSelection.current = val;
        if (val != null) {
            const cell = gameState.cells[val];
            const POPULATION_SCALE = 10000;
            setDistrictInfo([
                ~~((cell.truePopulation * POPULATION_SCALE) / 100) * 100,
                Math.round(cell.voterProportion * 100),
                Math.round((1 - cell.voterProportion) * 100),
            ]);
            // console.log("setting info");
        }
        if (currentSelection.current != null && mouseDown.current) {
            if (
                gameState.actionMode == "redistricting" &&
                startingSelection.current! <= gameState.maxDistricts
            ) {
                gameState.addCellToDistrict(
                    currentSelection.current,
                    startingSelection.current,
                );
                gameState.updateSusness();
            }
            setRenderCount(renderCount + 1);
        }
        console.log("curr " + val);
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

    const buildingsComp = useMemo(
        () => <Buildings grid={grid} perlin={gameState.perlinPopulation} />,
        [grid, gameState.perlinPopulation],
    );

    const oceanComp = useMemo(
        () => <Ocean />,
        []
    );

    const borderLines = useMemo(() => {
        const LINE_WIDTH = 0.01;
        const mp: Map<HalfEdge, THREE.Vector3[]> = new Map();
        grid.dcel.halfEdges.forEach((he) => {
            if (mp.has(he.twin)) {
                return;
            }
            const aToB = [he.b.pos[0] - he.a.pos[0], he.b.pos[1] - he.a.pos[1]];
            const bToLeft = [-aToB[1], aToB[0]];
            const len = Math.sqrt(Math.pow(aToB[0], 2) + Math.pow(aToB[1], 2));
            bToLeft[0] /= len / LINE_WIDTH;
            bToLeft[1] /= len / LINE_WIDTH;

            const rect = [
                [he.a.pos[0], he.a.pos[1]],
                [he.b.pos[0], he.b.pos[1]],
                [he.a.pos[0] + bToLeft[0], he.a.pos[1] + bToLeft[1]],
                [he.b.pos[0] + bToLeft[0], he.b.pos[1] + bToLeft[1]],
            ];

            const points = [
                ...rect.map(([x, z]) => new THREE.Vector3(x, 0, z)),
                ...rect.map(([x, z]) => new THREE.Vector3(x, 0.001, z)),
            ];
            mp.set(he.twin, points);
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
                    (point) => new THREE.Vector3(point.pos[0], 0, point.pos[1]),
                ),
            ]);
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
        <Canvas onPointerOut={() => setCurrentSelection(null)}>
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
                    return [
                        ...shell.map((he, i) => {
                            return (
                                <mesh
                                    key={i}
                                    geometry={
                                        new ConvexGeometry(borderLines.get(he)!)
                                    }
                                >
                                    <meshStandardMaterial color={"hotpink"} />
                                </mesh>
                            );
                        }),
                        ...faces.map((face, i) => {
                            return (
                                <mesh
                                    key={`h${i}`}
                                    geometry={
                                        new ConvexGeometry(
                                            gridPrisms.get(face)!,
                                        )
                                    }
                                    scale={[1, 0.01, 1]}
                                    position={[0, 0.001, 0]}
                                >
                                    <meshStandardMaterial
                                        color={"hotpink"}
                                        opacity={0.2}
                                        transparent
                                    />
                                </mesh>
                            );
                        }),
                    ];
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
                        removeCellFromDistrict={removeCellFromDistrict}
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
