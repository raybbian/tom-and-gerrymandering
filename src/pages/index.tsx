import GridCanvas from "@/graphics/canvas";
import { GridGenerator } from "@/scripts/grid";
import { GameState } from "@/scripts/game_state";
import { useState } from "react";

export default function Home() {
    const [grid, setGrid] = useState(new GridGenerator(5, 0.6));
    const [gameState, setGameState] = useState(new GameState(grid));

    return (
        <div className="bg-blue-950 w-[100dvw] h-[100dvh]">
            <GridCanvas grid={grid} gameState={gameState} />
        </div>
    );
}
