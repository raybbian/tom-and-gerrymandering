import {motion} from "framer-motion";
import Image from "next/image";
import  logo from "../assets/logo.png";
export default function TitleScreen({onClickHandler}: {onClickHandler: (e:number) => void}) {
 
    return (
        <div className="flex flex-col items-center justify-center h-screen text-[7vw] absolute z-30 w-screen bg-[#AF1D21]">
            <motion.button 
            initial={{scale:1}}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onClickHandler(0)}
            
            >
                <Image src={logo} alt="logo" className="h-[90vh] w-[90vh]"/>
            </motion.button>
        </div>
    );
}