import React, { useEffect } from 'react'
import {    
    $getSelection,
    $isRangeSelection
} from 'lexical';
import {
    $patchStyleText
  } from "@lexical/selection";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export default function FontSize({fontStyle}:{fontStyle:string}) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $patchStyleText(selection, {
                ["font-family"]: fontStyle
              });
            }
          })
    }, [fontStyle])
    return (<p style={{display: "none"}}>This</p>)
}