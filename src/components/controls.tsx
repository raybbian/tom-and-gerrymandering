import cheesefunny from "../assets/cheesefunny.png";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { GameState } from "@/scripts/game_state";
import { motion } from "framer-motion";

export default function Controls({
    level,
    gameState,
    setRenderCount,
    money,
}: {
    level: number;
    gameState: GameState;
    setRenderCount: Dispatch<SetStateAction<number>>;
    money: number;
}) {
    return (
        <div className="absolute z-10 bottom-[1vw] right-[1vw] ">
            <div className=" bg-secondary w-[18vw]  flex flex-col mt-[0.5vw] h-[5vw] rounded-t-[1vw]  border-4 border-black ">
                <div className="flex w-[100%] justify-evenly items-center h-[100%] text-textWhite font-sans font-semibold text-[0.8vw]">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            gameState.setActionMode("campaigning");
                            setRenderCount((e) => e + 1);
                        }}
                        className="h-[3.5vw] w-[6vw] bg-red rounded-[0.5vw]  border-[0.2vw] border-black"
                    >
                        CAMPAIGN
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            gameState.setActionMode("redistricting");
                            setRenderCount((e) => e + 1);
                        }}
                        className="h-[3.5vw] w-[6vw] bg-lblue rounded-[0.5vw]  border-[0.2vw] border-black"
                    >
                        REDISTRICT
                    </motion.button>
                </div>
            </div>
            <div className="h-[8vw] w-[18vw] rounded-b-[1vw] bg-primary border-black border-l-4 border-b-4 border-r-4 flex flex-col  items-center">
                <div className="flex items-center relative mt-[1vw]">
                    <p className="font-bold text-[2vw]">Level {level} </p>
                </div>
                <div className="flex mt-[.3vw] items-center">
                    <Image
                        src={cheesefunny}
                        alt="currency"
                        className=" object-cover w-[2vw] relative z-[6]"
                    ></Image>{" "}
                    <p className=" font-bold"> : </p>
                    <div className="bg-secondary w-[6vw] h-[2vw] rounded-[1vw] relative left-[0.2vw] z-[5] flex justify-center items-center border-black border-2">
                        <p className="relative font-sans font-semibold text-[1.2vw]">
                            ${money / 10}M
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
