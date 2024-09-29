import CampaignMenu from "@/components/campaign_menu";
import Controls from "@/components/controls";
import DialogueContainer from "@/components/dialogue_container";
import GridCanvas from "@/graphics/canvas";
import { GridGenerator } from "@/scripts/grid";
import { GameState } from "@/scripts/game_state";
import { useEffect, useMemo, useRef, useState } from "react";
import LevelTransition from "@/components/level-transition";

export default function Home() {
    const [uiRenderCount, setUiRenderCount] = useState(0);

    const [curLevel, setCurLevel] = useState(-1);

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

    return (
        <div className="bg-blue-950 w-[100dvw] h-[100dvh] absolute z-0 overflow-hidden">
            {levelTransition}
            {curLevel != -1 && (
                <>
                    <Controls
                        mode={states.current[curLevel].actionMode}
                        gameState={states.current[curLevel]}
                        setRenderCount={setUiRenderCount}
                    />
                    <CampaignMenu
                        onClickHandler={() =>
                            setTransitioning((curLevel + 1) % NUM_LEVELS)
                        }
                        cost={50}
                    />
                    <DialogueContainer />
                    {gridCanvas}
                </>
            )}
        </div>
    );
}
