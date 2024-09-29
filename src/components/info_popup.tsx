export default function InfoPopup({population, miceSupporters, catSupporters}: {population: string, miceSupporters: number, catSupporters: number}) {
    return(

        <div className="absolute z-10 w-[20vw] top-[5vw]  left-[1vw]">
            <div className="h-[6vw] bg-secondary rounded-t-[1vw] border-4 border-black flex justify-center items-center font-sans text-[1vw] font-bold">
                <h1>District Info</h1>
            </div>
            <div className="h-[14vw] bg-primary rounded-bl-[1vw] rounded-br-[1vw] border-b-4 border-l-4 border-r-4 border-black flex text-right font-sans text-[.9vw]">
                <div className="w-[10vw] h-[100%] flex flex-col justify-around">
                    <p>Population: </p>
                    <p>Mice supporters: </p>
                    <p>Cat supporters: </p>
                </div>
                <div className="flex flex-col justify-around">
                    <div className='bg-secondary w-[6vw] h-[2vw] rounded-[1vw] relative left-[0.2vw] z-[5] flex justify-center items-center border-black border-2'>
                        <p className='relative font-sans font-semibold text-[.8vw]'>High</p>
                    </div>
                    <div className='bg-secondary w-[6vw] h-[2vw] rounded-[1vw] relative left-[0.2vw] z-[5] flex justify-center items-center border-black border-2'>
                        <p className='relative font-sans font-semibold text-[.8vw]'>50%</p>
                    </div>
                    <div className='bg-secondary w-[6vw] h-[2vw] rounded-[1vw] relative left-[0.2vw] z-[5] flex justify-center items-center border-black border-2'>
                        <p className='relative font-sans font-semibold text-[.8vw]'>50%</p>
                    </div>
                </div>
                
            </div>
        </div>
    );
}