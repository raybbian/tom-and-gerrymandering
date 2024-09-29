import CampaignMenu from "@/components/campaign_menu";
import Controls from "@/components/controls";
import DialogueContainer from "@/components/dialogue_container";
import GridCanvas from "@/graphics/canvas";
import { GridGenerator } from "@/scripts/grid";
import { GameState } from "@/scripts/game_state";
import { useEffect, useMemo, useRef, useState } from "react";
import InfoPopup from "@/components/info_popup";
import RedistrictMenu from "@/components/redistrict_menu";
import LevelTransition from "@/components/level-transition";

export default function Home() {
    const [uiRenderCount, setUiRenderCount] = useState(0);

    const [curLevel, setCurLevel] = useState(-1);
    const [districtInfo, setDistrictInfo] = useState([0, 0, 0]);

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
                        states.current[curLevel].cells.forEach((_, i) => {
                            states.current[curLevel].cells[i].voterProportion -= Math.random() * 0.2;
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

    return (
        <div className="bg-blue-950 w-[100dvw] h-[100dvh] absolute z-0 overflow-hidden">
            {levelTransition}
            {curLevel != -1 && (
                <>
                    <Controls
                        susness={states.current[curLevel].susness}
                        mode={states.current[curLevel].actionMode}
                        gameState={states.current[curLevel]}
                        level={curLevel}
                        setRenderCount={setUiRenderCount}
                    />
                    {states.current[curLevel].actionMode == "redistricting"
                        ? <RedistrictMenu
                            onClickHandler={() => {
                                if (states.current[curLevel].validateNextState() == null) {
                                    setTransitioning((curLevel + 1) % NUM_LEVELS)
                                }
                            }}
                            cost={50}
                            remainingDistricts={
                                states.current[curLevel].maxDistricts - states.current[curLevel].numDistricts
                            }
                        />
                        : <CampaignMenu
                            cost={50}
                        />
                    }
                    <DialogueContainer text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." />
                    <InfoPopup population={districtInfo[0]} catSupporters={districtInfo[1]} miceSupporters={districtInfo[2]} />
                    {gridCanvas}
                </>
            )}
        </div>
    );
}
