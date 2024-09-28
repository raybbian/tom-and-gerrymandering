export default function Controls({mode, setMode}: {mode: string, setMode: (mode: string) => void}) {
    console.log(mode);
    return (
        <div className=" absolute z-10 bg-primary w-[10vw] h-[10vw] top-[10vh]" >
            <button onClick={() => setMode("campaign")}>CAMPAIGN</button>
            <button onClick={() => setMode("redistrict")}>REDISTRICT</button>
            <a>CURRENT MODE: {mode}</a>
        </div>
    );
}