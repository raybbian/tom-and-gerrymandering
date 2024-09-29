import CampaignMenu from "@/components/campaign_menu";
import Controls from "@/components/controls";
import DialogueContainer from "@/components/dialogue_container";
import GridCanvas from "@/graphics/canvas";
import { GridGenerator } from "@/scripts/grid";
import { GameState } from "@/scripts/game_state";
import { useEffect, useMemo, useRef, useState } from "react";
import InfoPopup from "@/components/info_popup";
import RedistrictMenu from "@/components/redistrict_menu";
import { AnimatePresence, motion } from "framer-motion";
import LevelTransition from "@/components/level-transition";
import tomhappy from "@/assets/tomhappy.jpg";
import tomsilly from "@/assets/tomsilly.png";

export default function Home() {
    const [uiRenderCount, setUiRenderCount] = useState(0);

    const [curLevel, setCurLevel] = useState(-1);
    const [districtInfo, setDistrictInfo] = useState([0, 0, 0]);
    const [dialogueImage, setDialogueImage] = useState(tomhappy);
    const [dialogueText, setDialogueText] = useState("I LOVE CHEESE");
    const [dialogueVisible, setDialogueVisible] = useState(false);

    const addDialogue = (text: string, image: any) => {
        setDialogueText(text);
        setDialogueImage(image);
        setDialogueVisible(true);
    };

    /**
     * set to level ID to go to next level
     */
    const [transitioning, setTransitioning] = useState(-1);

    const NUM_LEVELS = 5;
    const grids = useRef<GridGenerator[]>(Array(NUM_LEVELS));
    const states = useRef<GameState[]>(Array(NUM_LEVELS));

    useEffect(() => {
        const levelPromises: Promise<void>[] = Array(NUM_LEVELS);
        for (let i = 0; i < NUM_LEVELS; i++) {
            grids.current[i] = new GridGenerator(3 + Math.floor(i / 2), 0.6);
            levelPromises[i] = grids.current[i].init();
        }
        Promise.all(levelPromises).then(() => {
            for (let i = 0; i < NUM_LEVELS; i++) {
                states.current[i] = new GameState(grids.current[i]);
            }
            setCurLevel(0);
        });
    }, []);

    const gridCanvas = useMemo(() => {
        return (
            <GridCanvas
                setDistrictInfo={setDistrictInfo}
                grid={grids.current[curLevel]}
                gameState={states.current[curLevel]}
            />
        );
    }, [curLevel]);

    const levelTransition = useMemo(() => {
        if (transitioning != -1) {
            return (
                <LevelTransition
                    onScreenCovered={() => {
                        setCurLevel(transitioning);
                    }}
                    onTransitionFinished={() => {
                        setTransitioning(-1);
                    }}
                />
            );
        }
        return <></>;
    }, [transitioning]);

    const menuContainer = {
        hidden: {
            x: "30vw",
            opacity: 1,
            transition: { duration: 0.3, ease: "easeIn" },
        },
        visible: {
            x: 0,
            opacity: 1,
            transition: { duration: 0.3, delay: 0.4, ease: "easeOut" },
        },
    };

    return (
        <div className="bg-blue-950 w-[100dvw] h-[100dvh] absolute z-0 overflow-hidden">
            <button className="bg-black" onClick={()=> addDialogue("CHEEEEEEEEEEEEEEEEEEEEEEEEEESE (cheddar)", tomsilly)}>asdfjkasldkjf;alsd;laskjd</button>
            {levelTransition}
            {curLevel != -1 && (
                <>
                    <AnimatePresence>
                        {states.current[curLevel].actionMode ==
                        "redistricting" ? (
                            <motion.div
                                key={1}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={menuContainer}
                                className="absolute z-10"
                            >
                                <RedistrictMenu
                                    onClickHandler={() => {
                                        if (
                                            states.current[
                                                curLevel
                                            ].validateNextState() == null
                                        ) {
                                            setTransitioning(
                                                (curLevel + 1) % NUM_LEVELS,
                                            );
                                        }
                                    }}
                                    cost={50}
                                    remainingDistricts={
                                        states.current[curLevel].maxDistricts -
                                        states.current[curLevel].numDistricts
                                    }
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key={2}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={menuContainer}
                                className="absolute z-10"
                            >
                                <CampaignMenu cost={50} />
                            </motion.div>
                        )}
                        {dialogueVisible && 
                        <motion.div
                            key={3}
                            initial={{ y: "15vw" }}
                            animate={{ y: 0 }}
                            exit={{ y: "15vw" }}
                            className="absolute z-10 bottom-0 w-full"
                        >
                            
                            <DialogueContainer image={dialogueImage}  text={dialogueText} onClickHandler={() => setDialogueVisible(false)} />
                        </motion.div>}
                        
                    </AnimatePresence>
                    <InfoPopup
                        population={districtInfo[0]}
                        catSupporters={districtInfo[1]}
                        miceSupporters={districtInfo[2]}
                    />
                    <Controls
                        susness={states.current[curLevel].susness}
                        mode={states.current[curLevel].actionMode}
                        gameState={states.current[curLevel]}
                        level={curLevel}
                        setRenderCount={setUiRenderCount}
                    />
                    {gridCanvas}
                </>
            )}
        </div>
    );
}

