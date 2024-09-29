import CampaignMenu from "@/components/campaign_menu";
import Controls from "@/components/controls";
import DialogueContainer from "@/components/dialogue_container";
import DialoguePopup from "@/components/dialogue_popup";
import GridCanvas from "@/graphics/canvas";
import { GridGenerator } from "@/scripts/grid";
import { GameState } from "@/scripts/game_state";
import { useRef, useState } from "react";
import InfoPopup from "@/components/info_popup";
import RedistrictMenu from "@/components/redistrict_menu";

export default function Home() {
    const [grid, setGrid] = useState(new GridGenerator(5, 0.6));
    const [gameState, setGameState] = useState<GameState>(new GameState(grid));
    const [renderCount, setRenderCount] = useState(0);
    const [districtInfo, setDistrictInfo] = useState([0, 0, 0]);
    return (
        <div>
            <Controls mode={gameState.actionMode} level={9} gameState={gameState} setRenderCount={setRenderCount} susness={gameState.susness}/>
            {gameState.actionMode=="redistricting"
                ? <RedistrictMenu onClickHandler={() => console.log(gameState.validateNextState())} cost={50} remainingDistricts={gameState.maxDistricts - gameState.numDistricts} />
                : <CampaignMenu onClickHandler={() => console.log(gameState.validateNextState())} cost={50} />
            }
            <DialogueContainer text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."/>
            <InfoPopup population={districtInfo[0]} catSupporters={districtInfo[1]} miceSupporters={districtInfo[2]}/>
            <div className="bg-blue-950 w-[100dvw] h-[100dvh] absolute z-0">
                <GridCanvas grid={grid} gameState={gameState} setDistrictInfo={setDistrictInfo}/>
            </div>
        </div>
        
    );
}
