export default function InfoPopup({population, miceSupporters, catSupporters}: {population: number, miceSupporters: number, catSupporters: number}) {
    return(

        <div className="absolute z-10 w-[12vw] top-[10vw]  left-[1vw]">
            <div className="h-[3vw] bg-secondary rounded-t-[1vw] border-4 border-black flex justify-center items-center font-sans text-[1vw] font-bold">
                <h1>Cell Info</h1>
            </div>
            <div className="h-[7vw] bg-primary rounded-bl-[1vw] rounded-br-[1vw] border-b-4 border-l-4 border-r-4 border-black flex text-right font-sans text-[.9vw]">
                <div className="w-[8vw] h-[100%] flex flex-col justify-around">
                    <p>Population: </p>
                    <p>Mice supporters: </p>
                    <p>Cat supporters: </p>
                </div>
                <div className="flex flex-col justify-around">
                    <div className='bg-secondary w-[3vw] h-[1vw] rounded-[1vw] relative left-[0.2vw] z-[5] flex justify-center items-center border-black border-2'>
                        <p className='relative font-sans font-semibold text-[.8vw]'>{population}</p>
                    </div>
                    <div className='bg-secondary w-[3vw] h-[1vw] rounded-[1vw] relative left-[0.2vw] z-[5] flex justify-center items-center border-black border-2'>
                        <p className='relative font-sans font-semibold text-[.8vw]'>{miceSupporters}%</p>
                    </div>
                    <div className='bg-secondary w-[3vw] h-[1vw] rounded-[1vw] relative left-[0.2vw] z-[5] flex justify-center items-center border-black border-2'>
                        <p className='relative font-sans font-semibold text-[.8vw]'>{catSupporters}%</p>
                    </div>
                </div>
                
            </div>
        </div>
    );
}
