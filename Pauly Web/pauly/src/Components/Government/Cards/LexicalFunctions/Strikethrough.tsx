import React, { useEffect } from 'react'
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export default function Strikethrough({strikethrough}:{strikethrough:boolean}) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        if (strikethrough){
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
            console.log("This was ran")
        }
    }, [strikethrough])
    return (<p style={{display: "none"}}>This</p>)
}