import React, { useEffect } from 'react'
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export default function Underlined({underlined}:{underlined:boolean}) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        if (underlined){
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
            console.log("This was ran")
        }
    }, [underlined])
    return (<p style={{display: "none"}}>This</p>)
}