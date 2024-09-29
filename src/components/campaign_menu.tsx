import cheese from '../assets/cheesefunny.png';
import Image from 'next/image';

export default function CampaignMenu({onClickHandler, cost}: {onClickHandler: () => void, cost: number}) {
    return(
        <div className="flex absolute z-10 left-[80vw] top-[2vw] ">
            <div className="h-[calc(5vw+8px)] w-[calc(22vw+7px)] right-[0vw] top-[1vw]  ribbon absolute inline-block bg-black">
                <div className="h-[5vw] w-[22vw] top-[4px]  bg-red absolute right-[0vw] ribbon flex flex-col-reverse justify-center">
                    <h1 className=" font-Montserrat font-semibold text-lg text-textWhite w-100 h-100  text-center relative left-[1.3vw]">CAMPAIGN</h1>
                </div>
                <div className="h-[5vw] w-[22vw] top-[4px]  bg-yellow-200 absolute right-[0vw] ribbonAccent flex flex-col-reverse justify-center">
                    
                </div>
            </div>
            <div className='flex flex-col'>
                <div className="h-[20vw] w-[20vw] bg-primary border-l-4 border-t-4 border-b-4 border-black rounded-tl-[1vw]">
                        <div className='absolute h-[50%] w-[100%] top-[6.7vw] flex flex-col justify-center items-center  '>
                            <div className='w-[10vw] '>
                                <Image src={cheese} alt="cheese"  className='h-[100%] w-[100%] object-cover'/>
                            </div>
                            <div className="flex flex-col mt-[3%] text-[1vw] font-semibold text-textBlack text-">
                                <p>Cost: ${cost}</p>
                                <p>sex meter: {10}%</p>
                            </div>
                        </div>
                </div>
                <button onClick={() => onClickHandler()} className="bg-secondary w-[100%] h-[10vh] rounded-bl-[1vw] border-l-4 border-b-4 border-black">
                    <h1 className='font-sans font-semibold text-lg'>LAUNCH</h1>
                </button>
            </div>
        </div>
        
    );
}