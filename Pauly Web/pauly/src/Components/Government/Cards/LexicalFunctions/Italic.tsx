import React, { useEffect } from 'react'
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export default function Italic({italic}:{italic:boolean}) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        if (italic){
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
            console.log("This was ran")
        }
    }, [italic])
    return (<p style={{display: "none"}}>This</p>)
}