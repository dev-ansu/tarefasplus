import { MouseEvent, useRef, useState } from "react";

interface ConfirmationMessageProps{
    title?: string;
    yesTextButton?: string;
    noTextButton?: string;
    show?: boolean;
    onClick: ()=> Promise<void>;
}
const ConfirmationMessage = ({title = 'Você deseja realmente realizar esta ação?', yesTextButton = 'Sim', noTextButton = 'Não', show = false, onClick}: ConfirmationMessageProps)=>{
    const [showMessage, setShowMessage] = useState(show);

    const messageRef = useRef<HTMLDivElement | null>(null);

    const handleNoButtonClick = (e: MouseEvent<HTMLButtonElement>)=>{
        setShowMessage(!showMessage);
    }
    
    return(
        <>
            {show &&
                <div  className="w-full h-screen bg-[rgba(107,114,128,0.5)] flex justify-center items-center absolute top-0">
                    <div className="bg-white flex flex-col justify-center items-center w-full max-w-4xl p-8 rounded-lg">
                        <h1 className="text-4xl text-zinc-600 p-8 text-center">Você deseja realmente realizar esta ação?</h1>
                        <div className="flex gap-8">
                            <button type="button" onClick={handleNoButtonClick} className="bg-red-600 text-white font-medium text-lg py-2 px-14 rounded-lg">Não</button>
                            <button onClick={onClick} className="bg-blue-600 text-white font-medium text-lg py-2 px-14 rounded-lg">Sim</button>
                        </div>
                    </div>
                </div>

            }
        </>
    )
}

export default ConfirmationMessage;