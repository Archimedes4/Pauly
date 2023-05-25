import React, { useEffect } from 'react'
import {    
    $getSelection,
    DELETE_CHARACTER_COMMAND
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export default function OverflowPlugin({isOverflow}:{isOverflow: boolean}) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        editor.registerTextContentListener(textContent => {
            if (isOverflow) {
                editor.update(
                    () => {
                        editor.dispatchCommand(DELETE_CHARACTER_COMMAND, false)
                    },
                    {
                        tag: 'history-merge',
                    },
                );
            }
        });
    }, [editor]);
    return (<div style={{display: "none"}}></div>)
}
