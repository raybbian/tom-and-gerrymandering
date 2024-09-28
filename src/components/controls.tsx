import { GameState } from "@/scripts/game_state";

export default function Controls({mode, gameState}: {mode: string, gameState: GameState}) {
    console.log(mode);
    return (
        <div className=" absolute z-10 bg-primary w-[10vw] h-[10vw] top-[10vh]" >
            <button onClick={() => gameState.setActionMode("campaigning")}>CAMPAIGN</button>
            <button onClick={() => gameState.setActionMode("redistricting")}>REDISTRICT</button>
            <a>CURRENT MODE: {mode}</a>
        </div>
    );
}
