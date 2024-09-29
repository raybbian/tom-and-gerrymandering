import CampaignMenu from "@/components/campaign_menu";
import Controls from "@/components/controls";
import DialogueContainer from "@/components/dialogue_container";
import DialoguePopup from "@/components/dialogue_popup";
import GridCanvas from "@/graphics/canvas";
import { GridGenerator } from "@/scripts/grid";
import { GameState } from "@/scripts/game_state";
import { useState } from "react";
import InfoPopup from "@/components/info_popup";
import RedistrictMenu from "@/components/redistrict_menu";
import { AnimatePresence, delay, easeIn, easeInOut, motion, useAnimate } from "framer-motion";
export default function Home() {
    const [grid, setGrid] = useState(new GridGenerator(5, 0.6));
    const [gameState, setGameState] = useState<GameState>(new GameState(grid));
    const [renderCount, setRenderCount] = useState(0);

    const menuContainer = {
        hidden: { x: "30vw", opacity: 1, transition: { duration: 0.3, ease: "easeIn" } },
        visible: { x: 0, opacity: 1, transition: { duration: 0.3, delay: 0.4, ease: "easeOut"} },

    };

    return (
        <div>
            <div className="">
                <AnimatePresence >
                    <Controls mode={gameState.actionMode} level={9} gameState={gameState} setRenderCount={setRenderCount}/>
                    {gameState.actionMode=="redistricting" ? 
                    <motion.div
                    key={1}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={menuContainer}
                    className="absolute z-10"
                    >
                    <RedistrictMenu onClickHandler={() => console.log("troll")} cost={50} /> 

                    </motion.div>
                    :
                    <motion.div
                    key={2}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={menuContainer}
                    className="absolute z-10"
                    >
                        <CampaignMenu onClickHandler={() => console.log("troll")} cost={50} />

                    </motion.div>
                    
                    }
                    <DialogueContainer text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."/>
                    <InfoPopup population="High" catSupporters={50} miceSupporters={50}/>

                </AnimatePresence>
            </div>
            
            <div className="bg-blue-950 w-[100dvw] h-[100dvh] absolute z-0">
                <GridCanvas grid={grid} gameState={gameState}/>
            </div>
        </div>
        
    );
}
