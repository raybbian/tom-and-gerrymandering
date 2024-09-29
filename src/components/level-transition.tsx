import { useEffect, useRef, useState } from "react";

export default function LevelTransition({
    onScreenCovered,
    onTransitionFinished,
}: {
    /**
     *return when done with level init
     */
    onScreenCovered?: () => void;
    /**
     * delete this component when this cb is called
     */
    onTransitionFinished: () => void;
}) {
    const BORDER_RADIUS = 5000;
    const containerRef = useRef<HTMLDivElement>(null!);

    const [holeRadius, setHoleRadius] = useState(-1);

    useEffect(() => {
        const dims: [number, number] = [
            containerRef.current.clientWidth,
            containerRef.current.clientHeight,
        ];
        const radiusReq = Math.sqrt(
            Math.pow(dims[0], 2) + Math.pow(dims[1], 2),
        );
        setHoleRadius(radiusReq);

        setTimeout(() => {
            setHoleRadius(0);

            setTimeout(() => {
                if (onScreenCovered) onScreenCovered();
                console.log("Screen is covered");
                setHoleRadius(radiusReq);
                setTimeout(() => {
                    console.log("Transition finished");
                    onTransitionFinished();
                }, 2000);
            }, 2000);
        }, 100);
    }, [onScreenCovered, onTransitionFinished]);

    return (
        <div
            ref={containerRef}
            className="w-[100dvw] h-[100dvh] absolute z-50 grid place-items-center "
        >
            {holeRadius != -1 && (
                <div
                    className={`absolute rounded-full border-black duration-[2000ms] transition-all ease-in`}
                    style={{
                        width: holeRadius + 2 * BORDER_RADIUS,
                        height: holeRadius + 2 * BORDER_RADIUS,
                        borderWidth: BORDER_RADIUS,
                    }}
                />
            )}
        </div>
    );
}
