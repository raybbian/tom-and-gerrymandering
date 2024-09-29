import CampaignMenu from "@/components/campaign_menu";
import Controls from "@/components/controls";
import DialogueContainer from "@/components/dialogue_container";
import DialoguePopup from "@/components/dialogue_popup";
import GridCanvas from "@/graphics/canvas";
import { GridGenerator } from "@/scripts/grid";
import { GameState } from "@/scripts/game_state";
import { useState } from "react";

export default function Home() {
    const [grid, setGrid] = useState(new GridGenerator(5, 0.6));
    const [gameState, setGameState] = useState<GameState>(new GameState(grid));
    const [renderCount, setRenderCount] = useState(0);
    return (
        <div>
            <Controls mode={gameState.actionMode} gameState={gameState} setRenderCount={setRenderCount}/>
            <CampaignMenu onClickHandler={() => console.log(gameState.validateNextState())} cost={50} />
            <DialogueContainer />
            <div className="bg-blue-950 w-[100dvw] h-[100dvh] absolute z-0">
                <GridCanvas grid={grid} gameState={gameState}/>
            </div>
        </div>
        
    );
}
