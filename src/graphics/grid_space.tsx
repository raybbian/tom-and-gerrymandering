import * as THREE from "three";
import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";
import { ThreeElements, useFrame } from "@react-three/fiber";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";

export function GridSpace(
    props: ThreeElements["mesh"] &
        {
            points: THREE.Vector3[],
            currentSelection: number | null,
            setCurrentSelection: (val: number | null) => void,
            setMouseDown: (val: boolean) => void,
            setStartingSelection: (val: number) => void,
            index: number
        },
) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const [hovered, setHover] = useState(false);
    const [prevHovered, setPrevHovered] = useState(false);
    useFrame((_, delta) => {
        if (hovered) {
            meshRef.current.position.y += delta * 0.5;
            meshRef.current.position.y = Math.min(
                0.05,
                meshRef.current.position.y,
            );
            if (!prevHovered) {
                props.setCurrentSelection(props.index);
                setPrevHovered(true);
            }
        } else {
            meshRef.current.position.y -= delta * 0.5;
            meshRef.current.position.y = Math.max(
                0,
                meshRef.current.position.y,
            );
            setPrevHovered(false);
            if (props.currentSelection == props.index) {
                props.setCurrentSelection(null);
                console.log("a");
            }
        }
    });

    const geometry = useMemo(() => {
        return new ConvexGeometry(props.points); // Generate the geometry using the points prop
    }, [props.points]);

    return (
        <mesh
            {...props}
            ref={meshRef}
            geometry={geometry}
            onPointerDown={(e) => {
                e.stopPropagation();
                props.setMouseDown(true);
                props.setStartingSelection(props.index);
                props.setCurrentSelection(props.index)
                console.log("set starting selection");
            }}
            onPointerUp={(e) => {
                e.stopPropagation();
                props.setMouseDown(false);
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHover(true);
            }}
            onPointerOut={() => setHover(false)}
        >
            <meshStandardMaterial color={hovered ? "hotpink" : "#2f74c0"} />
        </mesh>
    );
}
