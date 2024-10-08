import Image from "next/image";
import mousetrap from "../assets/mousetrap.png";
import { motion } from "framer-motion";
import SusMeter from "./sus_meter";

export default function RedistrictMenu({
    resetHandler,
    submitHandler,
    remainingDistricts,
    susness,
}: {
    resetHandler: () => void;
    submitHandler: () => void;
    remainingDistricts: number;
    susness: number;
}) {
    return (
        <div className="flex absolute z-10 left-[80vw] top-[2vw] ">
            <div className="h-[calc(5vw+8px)] w-[calc(22vw+7px)] right-[0vw] top-[1vw]  ribbon absolute inline-block bg-black">
                <div className="h-[5vw] w-[22vw] top-[4px]  bg-lblue absolute right-[0vw] ribbon flex flex-col-reverse justify-center">
                    <h1 className=" font-Montserrat font-semibold text-lg text-textWhite w-100 h-100  text-center relative left-[1.3vw]">
                        REDISTRICT
                    </h1>
                </div>
                <div className="h-[5vw] w-[22vw] top-[4px]  bg-dblue absolute right-[0vw] ribbonAccent flex flex-col-reverse justify-center"></div>
            </div>
            <div className="flex flex-col">
                <div className="h-[25vw] w-[20vw] bg-primary border-l-4 border-t-4 border-b-4 border-black rounded-tl-[1vw]">
                    <div className="absolute h-[50%] w-[100%] top-[6vw] flex flex-col justify-center items-center  ">
                        <div className="w-[10vw] ">
                            <Image
                                src={mousetrap}
                                alt="cheese"
                                className="h-[100%] w-[100%] object-cover"
                            />
                        </div>
                        <div className="flex flex-col mt-[3%] text-[1vw] font-semibold text-textBlack text-">
                            <p>Remaining districts: {remainingDistricts}</p>
                        </div>
                        <div className="top-[6vw] flex flex-col items-center mt-[1vw] w-full">
                            <p className=" font-sans font-bold text-[1vw]">
                                SUSNESS
                            </p>
                            <SusMeter currentValue={susness} maxValue={1} />
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => resetHandler()}
                    className="bg-secondary w-[100%] h-[10vh] border-l-4 border-b-4 border-black"
                >
                    <motion.h1
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="font-sans font-semibold text-lg"
                    >
                        RESET
                    </motion.h1>
                </button>
                <button
                    onClick={() => submitHandler()}
                    className="bg-secondary w-[100%] h-[10vh] rounded-bl-[1vw] border-l-4 border-b-4 border-black"
                >
                    <motion.h1
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="font-sans font-semibold text-lg"
                    >
                        SUBMIT
                    </motion.h1>
                </button>
            </div>
        </div>
    );
}
