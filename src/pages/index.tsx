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

export default function Home() {
    const [_, setUiRenderCount] = useState(0);

    const [curLevel, setCurLevel] = useState(-1);
    const [districtInfo, setDistrictInfo] = useState([0, 0, 0]);

    /**
     * set to level ID to go to next level
     */
    const [transitioning, setTransitioning] = useState(-1);

    const NUM_LEVELS = 5;
    const grids = useRef<GridGenerator[]>(Array(NUM_LEVELS));
    const states = useRef<GameState[]>(Array(NUM_LEVELS));
    const [money, setMoney] = useState<number>(12);

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

    const [rerenderGrid, setRerenderGrid] = useState(0);

    const gridCanvas = useMemo(() => {
        return (
            <GridCanvas
                rerenderGrid={rerenderGrid}
                setDistrictInfo={setDistrictInfo}
                grid={grids.current[curLevel]}
                money={money}
                setMoney={setMoney}
                gameState={states.current[curLevel]}
            />
        );
    }, [curLevel, money, rerenderGrid]);

    const levelTransition = useMemo(() => {
        if (transitioning != -1) {
            return (
                <LevelTransition
                    onScreenCovered={() => {
                        states.current[
                            (transitioning + NUM_LEVELS - 1) % NUM_LEVELS
                        ].cells.forEach((cell) => {
                            cell.voterProportion -= Math.random() * 0.2;
                        });
                        setCurLevel(transitioning);
                    }}
                    onTransitionFinished={() => {
                        setTransitioning(-1);
                    }}
                />
            );
        }
        return <></>;
    }, [transitioning, states]);

    const menuContainer = {
        hidden: {
            x: "30vw",
            opacity: 1,
            transition: { duration: 0.2, ease: "easeIn" },
        },
        visible: {
            x: 0,
            opacity: 1,
            transition: { duration: 0.2, delay: 0.3, ease: "easeOut" },
        },
    };

    return (
        <div className="bg-blue-950 w-[100dvw] h-[100dvh] absolute z-0 overflow-hidden">
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
                                    resetHandler={() => {
                                        console.log("resetting");

                                        // states.current[curLevel].districts = new Map();
                                        Array.from(
                                            states.current[curLevel].cells,
                                        ).forEach((cell, i) => {
                                            states.current[
                                                curLevel
                                            ].removeCellFromDistrict(i);
                                        });
                                        states.current[curLevel].susness = 0;
                                        console.log(
                                            "districts: " +
                                                states.current[curLevel]
                                                    .districts.size,
                                        );
                                        setRerenderGrid((e) => e + 1);
                                        setUiRenderCount((e) => e + 1);
                                    }}
                                    submitHandler={() => {
                                        if (
                                            states.current[
                                                curLevel
                                            ].validateNextState() == null
                                        ) {
                                            setTransitioning(
                                                (curLevel + 1) % NUM_LEVELS,
                                            );
                                            setMoney((e: number) => e + 12);
                                        }
                                    }}
                                    remainingDistricts={
                                        states.current[curLevel].maxDistricts -
                                        states.current[curLevel].numDistricts
                                    }
                                    susness={states.current[curLevel].susness}
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
                    </AnimatePresence>
                    <DialogueContainer text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." />
                    <InfoPopup
                        population={districtInfo[0]}
                        catSupporters={districtInfo[1]}
                        miceSupporters={districtInfo[2]}
                    />
                    <Controls
                        gameState={states.current[curLevel]}
                        level={curLevel}
                        setRenderCount={setUiRenderCount}
                        money={money}
                    />
                    {gridCanvas}
                </>
            )}
        </div>
    );
}
