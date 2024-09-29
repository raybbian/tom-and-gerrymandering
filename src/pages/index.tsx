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
import TitleScreen from "@/components/title";
import tomalarmed from "@/assets/tomalarmed.png"
import tomevil from "@/assets/tomevil.png"
import tomgun from "@/assets/tomgun.png"

// const POSITIVE_LEGISLATION = [
//     "Dairy Agriculture Support Act: Establishes subsidies for sustainable dairy farming practices, benefiting both mozzarella and gorgonzola production without favoring either party's economic interests.",

//     "Cheese Labeling Transparency Act: Requires clear labeling of all cheese products, specifying ingredients, age, and origin. This ensures consumer choice between mozzarella and gorgonzola varieties based on informed decisions.",

//     "Artisanal Cheese Producer Protection Act: Provides financial support and reduced regulatory burden for small, independent cheese makers of both mozzarella and gorgonzola, promoting fair competition in the cheese industry.",

//     "Dairy Nutrition Education Program: Funds nationwide campaigns to educate citizens on the nutritional value of dairy products, promoting balanced consumption of mozzarella, gorgonzola, and other dairy foods.",

//     "Cheese Industry Innovation Incentives: Creates grants and tax credits for research into new cheese-making technologies and practices, benefiting both mozzarella and gorgonzola producers by encouraging innovation across the entire dairy sector.",

//     "Cheese Production Workforce Development Act: Invests in vocational training programs for workers in the dairy industry, helping both mozzarella and gorgonzola producers address labor shortages and ensure a skilled workforce.",

//     "Sustainable Packaging Initiative: Introduces requirements for environmentally friendly packaging of cheese products, ensuring that both mozzarella and gorgonzola producers contribute to reducing waste and promoting sustainability.",

//     "Fair Cheese Marketing Standards Act: Establishes guidelines for ethical marketing of cheese products, ensuring that mozzarella and gorgonzola producers engage in fair competition without misleading advertising or monopolistic practices.",

//     "Cheese Export Promotion Program: Provides funding to expand international marketing and export opportunities for both mozzarella and gorgonzola, promoting the global recognition of domestic cheeses and boosting the economy.",

//     "Dairy Price Stabilization Act: Implements a price stabilization mechanism to protect mozzarella and gorgonzola producers from extreme market fluctuations, ensuring a steady and fair income for all dairy farmers.",
// ];

const NEGATIVE_LEGISLATION = [
    "Single Cheese Mandate Act: Forces all citizens to consume only one type of cheese—either mozzarella or gorgonzola—based on their registered party affiliation, limiting personal freedom of choice and dividing society by cheese preference.",

    "Cheese Loyalty Tax: Imposes a heavy tax on citizens who purchase or consume cheese from the opposite party (e.g., Gorgonzola supporters buying mozzarella), creating financial penalties for personal preference and deepening societal divides.",

    "Cheese Purity Law: Enforces strict production regulations, banning any blending or hybrid cheese varieties between mozzarella and gorgonzola, stifling culinary creativity and innovation within the cheese industry.",

    "Anti-Crossover Consumption Act: Criminalizes public consumption of mozzarella by Gorgonzola supporters and vice versa, creating social tension and enforcing cheese-based segregation in public spaces like restaurants and markets.",

    "Cheese Party Education Doctrine: Mandates that schools teach children the superiority of either mozzarella or gorgonzola based on local majority rule, creating biased educational systems and undermining critical thinking in the younger generation.",

    "Partisan Dairy Farmers Bill: Provides government subsidies only to mozzarella or gorgonzola dairy farmers, depending on which party is in power, leading to financial instability for the opposing party’s producers and economic inequality in the dairy industry.",

    "National Cheese ID Program: Requires all citizens to carry identification cards stating their preferred cheese (mozzarella or gorgonzola), leading to widespread discrimination and social tension in workplaces, schools, and public services.",

    "Cheese Media Censorship Act: Grants the government authority to censor all media coverage that positively portrays the opposing cheese party, resulting in biased news reporting and suppression of free speech.",

    "Cheese-Based Voting Rights Law: Restricts voting rights to citizens who consume only one type of cheese, disenfranchising those who enjoy both mozzarella and gorgonzola or prefer neither, causing an erosion of democratic representation.",

    "Cheese-Free Zones Act: Establishes zones where mozzarella or gorgonzola are completely banned, creating pockets of cultural and economic exclusion, further isolating citizens and limiting access to their preferred cheese products.",
];

export default function Home() {
    const [_, setUiRenderCount] = useState(0);

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

    const [titleScreen, setTitleScreen] = useState(true);

    /**
     * set to level ID to go to next level
     */
    const [transitioning, setTransitioning] = useState(-1);

    const NUM_LEVELS = 5;
    const grids = useRef<GridGenerator[]>(Array(NUM_LEVELS));
    const states = useRef<GameState[]>(Array(NUM_LEVELS));
    const [money, setMoney] = useState<number>(12);
    function getMaxDistricts(i: number) {
        if (i == 0 || i == 1) {
            return 5;
        } else if (i == 2) {
            return 7;
        } else if (i == 3) {
            return 9;
        } else {
            return 11;
        }
    }
    useEffect(() => {
        const levelPromises: Promise<void>[] = Array(NUM_LEVELS);
        for (let i = 0; i < NUM_LEVELS; i++) {
            grids.current[i] = new GridGenerator(3 + Math.floor(i / 2), 0.6);
            levelPromises[i] = grids.current[i].init();
        }
        Promise.all(levelPromises).then(() => {
            for (let i = 0; i < NUM_LEVELS; i++) {
                states.current[i] = new GameState(grids.current[i], getMaxDistricts(i));
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
                        setTitleScreen(false);

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
        
            {titleScreen && <TitleScreen onClickHandler={setTransitioning}></TitleScreen>}

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
                                        function tomRandom() {
                                            const toms = [
                                                tomhappy,
                                                tomsilly,
                                                tomalarmed,
                                                tomevil,
                                                tomgun,
                                            ]
                                            const v = Math.floor(Math.random() * toms.length);
                                            return toms[v];
                                        }
                                        const submission = states.current[
                                                curLevel
                                            ].validateNextState();
                                        if (submission == "not all cells are in a district") {
                                            addDialogue("Each cell needs to be in a district!", tomRandom());
                                        } else if (submission == "bad districts!") {
                                            addDialogue("Some of your districts are disconnected!", tomRandom());
                                        } else if (submission == "too sus!") {
                                            addDialogue("Your redistricting plan is too sussy! The governor will veto it!", tomRandom());
                                        } else if (submission == "not enough districts!") {
                                            addDialogue("You need to have exactly " + states.current[curLevel].maxDistricts + " districts!", tomRandom());
                                        } else if (submission == "not enough votes!") {
                                            addDialogue("Your redistricting plan doesn't win you enough votes!", tomRandom());
                                        } else {
                                        // if (
                                        //     states.current[
                                        //         curLevel
                                        //     ].validateNextState() == null
                                        // ) {
                                            const electoral_votes = states.current[curLevel].totalElectoralVotes;
                                            let vote_fraction = electoral_votes / states.current[curLevel].maxDistricts;
                                            vote_fraction = ~~(vote_fraction * 100);
                                            let extraDialogue = "";
                                            if (vote_fraction >= 65) {
                                                extraDialogue = " Since you got over 65% of the electoral votes, you get a bonus $300K!";
                                                setMoney((e: number) => e + 3);
                                            }
                                            extraDialogue += " You passed the following policy during this term: \n" + NEGATIVE_LEGISLATION[Math.trunc(Math.random() * NEGATIVE_LEGISLATION.length)]
                                            addDialogue("You got " + electoral_votes + " electoral votes, and now control " + vote_fraction + "% of congress." + extraDialogue, tomhappy);
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
                                <CampaignMenu />
                            </motion.div>
                        )}
                        {dialogueVisible && (
                            <motion.div
                                key={3}
                                initial={{ y: "15vw" }}
                                animate={{ y: 0 }}
                                exit={{ y: "15vw" }}
                                className="absolute z-50 bottom-0 w-full"
                            >
                                <DialogueContainer
                                    image={dialogueImage}
                                    text={dialogueText}
                                    onClickHandler={() =>
                                        setDialogueVisible(false)
                                    }
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
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
