import React, { useEffect } from 'react'
import {    
  $getSelection,
  $isRangeSelection
} from 'lexical';
import {
  $patchStyleText
} from "@lexical/selection";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export default function FontSize({value, style}:{value:string, style: string}) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $patchStyleText(selection, {
                [style]: value
              });
            }
          })
    }, [value, style])
    return (<p style={{display: "none"}}>This</p>)
}