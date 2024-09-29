import { GameState } from "@/scripts/game_state";
import { Dispatch, SetStateAction } from "react";

export default function Controls({mode, gameState, setRenderCount}: {mode: string, gameState: GameState, setRenderCount: Dispatch<SetStateAction<number>>}) {
    return (
        <div className=" absolute z-10 bg-primary w-[10vw] h-[10vw] top-[10vh]" >
            <button onClick={() => {gameState.setActionMode("campaigning"); setRenderCount(e => e + 1)}}>CAMPAIGN</button>
            <button onClick={() => {gameState.setActionMode("redistricting"); setRenderCount(e => e + 1)}}>REDISTRICT</button>
            <a>CURRENT MODE: {mode}</a>
        </div>
    );
}
