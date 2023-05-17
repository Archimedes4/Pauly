import React, { useEffect, useState, useRef } from 'react'
import { Button, Dropdown } from 'react-bootstrap'
import DropdownMenu from 'react-bootstrap/esm/DropdownMenu';
import {
    $createParagraphNode,
    $getNodeByKey,
    $getRoot,
    $getSelection,
    $isRangeSelection,
    $isRootOrShadowRoot,
    $isTextNode,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    COMMAND_PRIORITY_NORMAL,
    DEPRECATED_$isGridSelection,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    INDENT_CONTENT_COMMAND,
    KEY_MODIFIER_COMMAND,
    OUTDENT_CONTENT_COMMAND,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
  } from 'lexical';
import {
  $patchStyleText
} from "@lexical/selection";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import DropdownColorPicker from '../../ui/DropdownColorPicker';
import { $createOverflowNode } from "@lexical/overflow"

export default function EditorToolbar() {
  const refInput = useRef(null);
  const [editor] = useLexicalComposerContext();
  const [fonts, setFonts] = useState<string[]>(["Times New Roman", "Georgia", "Garamond", "Arial", "Verdana", "Helvetica", "Brush Script MT"])
  const [fontSizes, setFontSizes] = useState<string[]>(["10px", "12px", "14px", "16px", "18px", "20px", "36px"])
  function ChangeFont(font: string){
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, {
          ["font-family"]: font
        });
      }
    })
  }
  function ChangeFontSize(fontSize: string){
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, {
          ["font-size"]: fontSize
        });
      }
    })
  }
  return (<p style={{width: 0, height: 0, padding: 0, margin: 0}}></p>)
  // (
  //   <div>
  //       <Button onClick={() => {editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}}>
  //           Bold
  //       </Button>
  //       <Button onClick={() => {editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}}>
  //           Italics
  //       </Button>
  //       <Button onClick={() => {editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}}>
  //           Underline
  //       </Button>
  //       <Dropdown>
  //         <Dropdown.Toggle id="dropdown-custom-components">
  //           <div style={{height:"2vh"}}>
  //             <p>Font</p>
  //           </div>
  //         </Dropdown.Toggle>
  //         <DropdownMenu> 
  //           {fonts.map((item: string) => (
  //             <Dropdown.Item eventKey="2" onClick={() => {ChangeFont(item)}}>{item}</Dropdown.Item>
  //           ))}
  //         </DropdownMenu>
  //       </Dropdown>
  //       <Dropdown>
  //         <Dropdown.Toggle id="dropdown-custom-components">
  //           <div style={{height:"2vh"}}>
  //             <p>Font Sizes</p>
  //           </div>
  //         </Dropdown.Toggle>
  //         <DropdownMenu> 
  //           {fontSizes.map((item: string) => (
  //             <Dropdown.Item eventKey="2" onClick={() => {ChangeFontSize(item)}}>{item}</Dropdown.Item>
  //           ))}
  //         </DropdownMenu>
  //       </Dropdown>
  //       <Button onClick={() => {
  //         editor.update(() => {
  //           $createOverflowNode()
  //         })
  //       }}>Create Node</Button>
  //       <Button onClick={() => {
  //         console.log(editor.getEditorState())
  //       }}>Print Shit</Button>
  //       {/* <DropdownColorPicker
  //           buttonClassName="toolbar-item color-picker"
  //           buttonAriaLabel="Formatting text color"
  //           buttonIconClassName="icon font-color"
  //           color={fontColor}
  //           onChange={onFontColorSelect}
  //           title="text color"
  //         /> */}
  //   </div>
  // )
}


// export function changeFontBold(){
//   const [editor] = useLexicalComposerContext();
//   useEffect(() => {
//     editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
//   }, [])
//   return (<p>This</p>)
// }