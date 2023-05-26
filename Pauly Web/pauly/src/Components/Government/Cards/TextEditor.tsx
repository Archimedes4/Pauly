import React, {useRef, useLayoutEffect, useState} from 'react'
import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import Bold from './LexicalFunctions/Bold.tsx';
import FontSize from './LexicalFunctions/FontSize.tsx';
import FontStyle from './LexicalFunctions/FontStyle.tsx';
import Italic from './LexicalFunctions/Italic.tsx';
import Strikethrough from './LexicalFunctions/Strikethrough.tsx';
import Underlined from './LexicalFunctions/Underline.tsx';
import OverflowPlugin from './LexicalFunctions/OverflowPlugin.tsx';
import PlaygroundNodes from './playgroundNode.ts';
import PlaygroundEditorTheme from './EditorTheme.ts';
import { TextFocusPlugin } from './TextFocusPlugin.tsx';
import { MaxLengthPlugin } from './MaxLengthPlugin.tsx';
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import styles from "./Cards.module.css"
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';

const EMPTY_CONTENT = '{"root":{"children":[{"children":[{"type":"overflow", "size":10}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

const editorConfig = {
    editorState: EMPTY_CONTENT,
    namespace: 'Playground',
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
};

export default function TextEditor({onIsUserTyping, zoomScale, isUserTyping, item, bolded, italic, strikethrough, underlined, fontSize, fontStyle, selectedElementValue}:{onIsUserTyping: (item: boolean) => void, zoomScale: number, isUserTyping: boolean, item: CardElement, bolded: boolean, italic:boolean, strikethrough: boolean, underlined: boolean, fontSize: string, fontStyle: string, selectedElementValue: CardElement}) {
    const DivRef = useRef(null)
    const [isOverflow, setIsOverflow] = useState<boolean>(false)
    return (
        <div>
            <LexicalComposer initialConfig={editorConfig}>
                <div onClick={() => {
                    onIsUserTyping(!isUserTyping)
                }} style={{height: (item.Height * (zoomScale/100)) + "px", width: (item.Width * (zoomScale/100)) + "px", overflow: "hidden"}} >
                    <div ref={DivRef} style={{border: "5px solid yellow", height: "auto"}}>
                        <RichTextPlugin contentEditable={<ContentEditable style={{height: "100%"}} className={styles.ContentEditable}/>} placeholder={<p style={{padding: 0, margin: 0}}>Double Click To Add Text</p>} ErrorBoundary={LexicalErrorBoundary} />
                        <TextFocusPlugin isSelected={(isUserTyping === true && selectedElementValue?.ElementIndex === item.ElementIndex)}/>
                        {(selectedElementValue?.ElementIndex === item.ElementIndex) ? 
                        <>
                            <Bold bolded={bolded}/>
                            <Italic italic={italic}/>
                            <Strikethrough strikethrough={strikethrough}/>
                            <Underlined underlined={underlined}/>
                            <FontSize fontSize={fontSize} />
                            <FontStyle fontStyle={fontStyle}/>
                            <OverflowPlugin isOverflow={isOverflow} setIsOverflow={setIsOverflow}/>
                            <OnChangePlugin onChange={() => {
                                if (DivRef.current.clientHeight > item.Height) {
                                    setIsOverflow(true)
                                }
                            }} />
                        </>:null
                        }
                    </div>
                </div>
            </LexicalComposer>
        </div>
    )
}
