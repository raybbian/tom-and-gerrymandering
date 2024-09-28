import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { ThreeElements, useFrame } from "@react-three/fiber";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";

export function GridSpace(
    props: ThreeElements["mesh"] & { points: THREE.Vector3[] },
) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const [hovered, setHover] = useState(false);
    useFrame((_, delta) => {
        if (hovered) {
            meshRef.current.position.y += delta * 0.5;
            meshRef.current.position.y = Math.min(
                0.05,
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

    return (
        <mesh
            {...props}
            ref={meshRef}
            geometry={geometry}
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
