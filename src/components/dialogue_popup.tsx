import Image from 'next/image';
import tomsilly from '../assets/tomsilly.png';
import tomhappy from '../assets/tomhappy.jpg';


export default function DialoguePopup({text}: {text: string}, {image}: {image: string}) {
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
                    <Image src={tomhappy} alt="tom" className="object-cover h-[100%] rounded-l-[1vw] "></Image>
                </div>
                
            </div>
            <div className="w-[60vw] h-[10vw] bg-primary border-4 border-black rounded-r-[1vw] p-[1vw] flex">
                <div className="flex items-center h-[100%]  relative ">
                    <p>{text}</p>
                </div>
            </div>
        </div>
        

    );
}
