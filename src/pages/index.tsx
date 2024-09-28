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
    const [gameState, setGameState] = useState(new GameState(grid));
    const [mode, setMode] = useState<string>("campaign");
    return (
        <div>
            <Controls mode={mode} setMode={setMode}/>
            <CampaignMenu onClickHandler={() => console.log("troll")} cost={50} />
            <DialogueContainer />
            <div className="bg-blue-950 w-[100dvw] h-[100dvh] absolute z-0">
                <GridCanvas grid={grid} gameState={gameState}/>
            </div>
        </div>
        
    );
}
