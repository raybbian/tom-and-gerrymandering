import DialoguePopup from "./dialogue_popup";
import Image from 'next/image';
import tomsilly from '../assets/tomsilly.png';

export default function DialogueContainer({text, image, onClickHandler}: {text: string, image:any, onClickHandler: () => void}) {
    return(
        <div className="absolute bottom-[1vw] left-[5vw] z-10 w-fit h-fit ">
            {/* <Image src={tomsilly} alt="tom" className="relative object-cover h-[30vw] "></Image> */}

            <div className=" absolute bottom-0 z-20 ">
                <DialoguePopup  text={text} image={image} onClickHandler={()=> onClickHandler()}/>
            </div>
            
        </div>
    )
}