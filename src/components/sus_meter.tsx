export default function SusMeter({currentValue, maxValue}: {currentValue: number, maxValue: number}) {
    return (
        <>
            <progress value={currentValue} max={maxValue} className="rounded-[1vw] border-black border-2 w-[80%]"></progress>
        </>
        
    );

}