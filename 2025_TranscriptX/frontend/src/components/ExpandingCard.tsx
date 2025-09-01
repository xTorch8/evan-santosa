import { useState } from "react";


export default function ExpandingCard() {
    const [isOpen, setIsOpen] = useState(true);
    const [isClosedByClick, setIsClosedByClick] = useState(false);

    const handleClick = () => {
        setIsOpen(false);
        setIsClosedByClick(true);
    }

    return (
        <div 
            onClick={handleClick}
            onMouseEnter={() => {
                if (isClosedByClick) setIsOpen(true);
            }}
            className={`group relative shadow-[0_5px_5px_rgba(0,0,0,0.25)] hover:shadow-[0_10px_10px_rgba(0,0,0,0.25)] transition-all duration-700 ease-in-out cursor-pointer overflow-hidden ${isOpen ? "w-[400px]" : "w-[15px]"} min-h-[480px] bg-color_secondary`}>
            
            <div className={`fixed inset-0 flex-col items-center max-h-0 opacity-0 group-hover:opacity-100 mt-[80px] ml-[30px] transition-all duration-400 ease-in-out max-w-[350px] ${isOpen ? "opacity-100 mt-[50px] max-h-[200px]" : "opacity-0 mt-0 max-h-0"}`}>
                <h1 className="text-black text-center text-[36px]">
                    Get Started!
                </h1>
                <p className="mt-[30px] text-center">
                    Start Transcribing and Summarizing Smarter with AI.
                </p>
                <p className="mt-[20px] text-center">
                    Join TranscriptX to unlock seamless, accurate, and fast summarization and audio-to-text conversion, powered by AI.
                </p>
                <p className="mt-[60px] text-center opacity-40">
                    (Click again to close)
                </p>

            </div>
        </div>
    );
}