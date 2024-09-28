import GridCanvas from "@/graphics/canvas";
import { GridGenerator } from "@/scripts/grid";
import { useState } from "react";

export default function Home() {
    const [grid, setGrid] = useState(new GridGenerator(8, 0.6));

    return (
        <div className="bg-blue-950 w-[100dvw] h-[100dvh]">
            <GridCanvas grid={grid} />
        </div>
    );
}
