import React, { useEffect } from 'react'
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export default function Bold({bolded}:{bolded:boolean}) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        if (bolded){
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
            console.log("This was ran")
        }
    }, [bolded])
    return (<p style={{display: "none"}}>This</p>)
}