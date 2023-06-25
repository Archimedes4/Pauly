import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, RangeSelection, MOVE_TO_START, LexicalEditor } from 'lexical';
import React, { useEffect } from 'react'
import {$patchStyleText} from "@lexical/selection"
import {$generateHtmlFromNodes} from '@lexical/html';

export default function BoldPlugin({bold, italic, underline, strikethrough, selectedFontStyle, selectedFontSize, selectedTextColor, selectedHighlightColor, onSetIsBold, onSetIsItalic, onSetIsStrikethrough, onSetIsSubscript, onSetIsSuperscript, onSetIsUnderline, onEditorStateChange}:
    {
        bold: boolean, 
        italic: boolean,
        underline: boolean,
        strikethrough: boolean,
        selectedFontStyle: string,
        selectedFontSize: string
        selectedTextColor: string,
        selectedHighlightColor: string,
        onSetIsBold: (item: boolean) => void,  
        onSetIsItalic: (item: boolean) => void,  
        onSetIsUnderline: (item: boolean) => void,  
        onSetIsStrikethrough: (item: boolean) => void, 
        onSetIsSubscript: (item: boolean) => void,  
        onSetIsSuperscript: (item: boolean) => void,
        onEditorStateChange: (item: string) => void
    }){
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
    }, [bold])

    useEffect(() => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
    }, [italic])

    useEffect(() => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
    }, [underline])

    useEffect(() => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
    }, [strikethrough])

    useEffect(() => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            'font-size':selectedFontSize
          })
        }
      })
    }, [selectedFontSize])

    useEffect(() => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            'font-family':selectedFontStyle
          })
        }
      })
    }, [selectedFontStyle])

    useEffect(() => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            'color':selectedTextColor
          })
        }
      })
    }, [selectedTextColor])

    useEffect(() => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            'background-color':selectedHighlightColor
          })
        }
      })
    }, [selectedHighlightColor])

    useEffect(() => {
        editor.registerUpdateListener(({editorState}) => {
          // Read the editorState and maybe get some value.
          editorState.read(() => {
            // ...
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              // Update text format
              onSetIsBold(selection.hasFormat('bold'));
              onSetIsItalic(selection.hasFormat('italic'));
              onSetIsUnderline(selection.hasFormat('underline'));
              onSetIsStrikethrough(selection.hasFormat('strikethrough'));
              onSetIsSubscript(selection.hasFormat('subscript'));
              onSetIsSuperscript(selection.hasFormat('superscript'));
      
              // // Handle buttons
              // setFontSize(
              //   $getSelectionStyleValueForProperty(selection, 'font-size', '15px'),
              // );
              // setFontColor(
              //   $getSelectionStyleValueForProperty(selection, 'color', '#000'),
              // );
              // setBgColor(
              //   $getSelectionStyleValueForProperty(
              //     selection,
              //     'background-color',
              //     '#fff',
              //   ),
              // );
              // setFontFamily(
              //   $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial'),
              // );
            }
            const editorString = editor.getEditorState()
            const editorString1 = editorString.toJSON()
            const jsonString = JSON.stringify(editorString1);
            onEditorStateChange(jsonString)
          });
        
          // Then schedule another update.
          editor.update(() => {
            // ...
            // onScrollTop()'
            // console.log("Thi")
            // editor.dispatchCommand(MOVE_TO_START)
            
          });
        });
    }, [editor])
    return (
        <div style={{display: "none"}}></div>
    )
}

