import DialoguePopup from "./dialogue_popup";
import Image from 'next/image';
import tomsilly from '../assets/tomsilly.png';

export default function DialogueContainer() {
    return(
        <div className="absolute bottom-[1vw] left-[5vw] z-10 w-fit h-fit ">
            {/* <Image src={tomsilly} alt="tom" className="relative object-cover h-[30vw] "></Image> */}
            

            <div className=" absolute bottom-0 z-20 ">
                <DialoguePopup text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."/>
            </div>
            
        </div>
    )
}