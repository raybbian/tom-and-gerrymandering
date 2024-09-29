import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { Color, ThreeElements, useFrame } from "@react-three/fiber";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";
import { lerp } from "three/src/math/MathUtils.js";

export function GridSpace(
    props: ThreeElements["mesh"] & {
        points: THREE.Vector3[];
        currentSelection: number | null;
        setCurrentSelection: (val: number | null) => void;
        setMouseDown: (val: boolean) => void;
        setStartingSelection: (val: number) => void;
        index: number;
        proportion: number;
        population: number;
    },
) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const [hovered, setHover] = useState(false);

    useFrame((_, delta) => {
        if (hovered) {
            meshRef.current.position.y += delta * 0.5;
            meshRef.current.position.y = Math.min(
                0.01,
                meshRef.current.position.y,
            );
        } else {
            meshRef.current.position.y -= delta * 0.5;
            meshRef.current.position.y = Math.max(
                0,
                meshRef.current.position.y,
            );
        }
    });

    const geometry = useMemo(() => {
        return new ConvexGeometry(props.points); // Generate the geometry using the points prop
    }, [props.points]);

    const shift = 1.5;
    const p =
        props.proportion < 0.5
            ? Math.pow(props.population, shift)
            : 1 - Math.pow(1 - props.proportion, shift);

    const col: Color = [0, 0, 0];
    // switch (p) {
    //     case 1: col = [0, 0, 0];
    //     break;
    //     case 2: col = [.2, .2, .2];
    //     break;
    //     case 3: col = [1, 1, 1];
    //     break;
    // }
    const beige = [0.0, 0.0, 0.0];
    const green = [1.0, 1.0, 1.0];
    col[0] = lerp(green[0], beige[0], p);
    col[1] = lerp(green[1], beige[1], p);
    col[2] = lerp(green[2], beige[2], p);

    return (
        <mesh
            {...props}
            ref={meshRef}
            geometry={geometry}
            onPointerDown={(e) => {
                e.stopPropagation();
                if (e.button != 0) return;
                props.setMouseDown(true);
                props.setStartingSelection(props.index);
                props.setCurrentSelection(props.index);
                console.log("set starting selection");
            }}
            onPointerUp={(e) => {
                e.stopPropagation();
                if (e.button != 0) return;
                props.setMouseDown(false);
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                props.setCurrentSelection(props.index);
                setHover(true);
            }}
            onPointerOut={() => {
                setHover(false);
                props.setCurrentSelection(null);
            }}
        >
            <meshStandardMaterial color={hovered ? "hotpink" : col} />
        </mesh>
    );
}
