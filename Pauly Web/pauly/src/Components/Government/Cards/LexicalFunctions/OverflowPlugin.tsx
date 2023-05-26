import React, { useEffect, useRef } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {trimTextContentFromAnchor} from '@lexical/selection';
import {$restoreEditorState} from '@lexical/utils';
import {$getSelection, $isRangeSelection, EditorState, RootNode} from 'lexical';

export default function OverflowPlugin({isOverflow, setIsOverflow}:{isOverflow: boolean, setIsOverflow: (item: boolean) => void}) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        console.log("Update")
        if (isOverflow){
            editor.update(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
                    return;
                }
                const anchor = selection.anchor;
                trimTextContentFromAnchor(editor, anchor, 1);
                setIsOverflow(false)
            }) 
            
            // const prevEditorState = editor.getEditorState();
            // const prevTextContentSize = prevEditorState.read(() =>
            //     rootNode.getTextContentSize(),
            // );
            // const textContentSize = rootNode.getTextContentSize();
            // if (prevTextContentSize !== textContentSize) {
            //     const delCount = 1
        
            //     if (1 > 0) {
            //         // Restore the old editor state instead if the last
            //         // text content was already at the limit.
            //         if (
            //             prevTextContentSize === (textContentSize - 1) &&
            //             lastRestoredEditorState !== prevEditorState
            //         ) {
            //             lastRestoredEditorState = prevEditorState;
            //             $restoreEditorState(editor, prevEditorState);
            //         } else {
            //             trimTextContentFromAnchor(editor, anchor, 1);
            //         }
            //     }
            // }
        }
    }, [editor, isOverflow]);

    return (<div style={{display: "none"}}></div>)
}
