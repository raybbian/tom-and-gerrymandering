import Image from 'next/image';
import tomsilly from '../assets/tomsilly.png';
import tomhappy from '../assets/tomhappy.jpg';
import {motion} from 'framer-motion';

export default function DialoguePopup({text, image, onClickHandler}: {text: string,image:any, onClickHandler: () => void}) {

    const basedelay = .3;
    const characterAnimation = {
        hidden: {
          opacity: 0,
          y: `0.25em`,
        },
        visible: {
          opacity: 1,
          y: `0em`,
          transition: {
            duration: 1,
            ease: [0.2, 0.65, 0.3, 0.9],
          },
        },
      };
    
    return(
        // <div className="w-[60vw] h-[10vw] bg-primary border-4 border-black rounded-[1vw] p-[1vw]">
        //     <div className="flex w-[100%] h-[20%]" >
        //         <div className="bg-secondary ml-[-1vw] mt-[-1vw] rounded-tl-[1vw] rounded-br-[1vw] w-[10%] border-r-4 border-b-4 border-black flex justify-center items-center">
        //             <h1 className="font-sans font-semibold text-base"> TOM </h1>
        //         </div>
        //         <div className="w-[89%] relative left-[1%] h-0 border-2 border-black">
        //         </div>
        //     </div>
        //     <div className="flex items-center h-[60%]  relative top-[10%]">
        //         <p>{text}</p>
        //     </div>
        // </div>
        <div className="flex">
            <div className="w-[10vw] h-[10vw] bg-secondary rounded-l-[1vw] border-l-4 border-t-4 border-b-4 border-black flex justify-center items-center">
                <div className=' w-[90%] h-[90%] border-4 border-black rounded-l-[1vw]'>
                    <Image src={image}  alt="tom" className="object-cover h-[100%] rounded-l-[1vw]"></Image>
                </div>
                
            </div>
            <button onClick={() => onClickHandler()} className="w-[60vw] h-[10vw] bg-primary border-4 border-black rounded-r-[1vw] p-[1vw] flex">
                <div className="flex items-center h-[100%] flex-wrap content-center justify-center w-[100%] p-[2%] relative ">
                    {text.split("").map((letter, i:number) => {
                        return (
                            <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                                duration: 0.02,
                                delay: basedelay + i / 100 
                            }}
                            key={i}
                            >
                             {letter === " " ? "\u00A0" : letter}
                            </motion.span>
                        );
                       
                    })}
                </div>
            </button>
        </div>
        

    );
}
