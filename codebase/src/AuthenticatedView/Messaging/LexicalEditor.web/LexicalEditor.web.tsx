import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {ClearEditorPlugin} from '@lexical/react/LexicalClearEditorPlugin';
import {HorizontalRulePlugin} from '@lexical/react/LexicalHorizontalRulePlugin';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {TabIndentationPlugin} from '@lexical/react/LexicalTabIndentationPlugin';
import * as React from 'react';
import {useEffect, useRef, useState} from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import {EditorState, EditorThemeClasses} from 'lexical';
import theme from './LexicalTheme';

import InitialInsertIntoEditor from "./InitialInsertIntoEditor.web"

export default function Editor({width, height, EditorState, bolded, italic, underlined, strikethrough, selectedFontSize, selectedFontStyle, selectedHighlightColor, selectedTextColor,
    onSetIsBold, onSetIsItalic, onSetIsUnderline, onSetIsStrikethrough, onSetIsSubscript, onSetIsSuperscript, onEditorStateChange}:{
    width: number, 
    height: number,
    EditorState: string, 
    bolded: boolean, 
    italic: boolean, 
    underlined: boolean, 
    strikethrough: boolean, 
    selectedFontSize: string,
    selectedFontStyle: string,
    selectedHighlightColor: string,
    selectedTextColor: string,
    onSetIsBold: (item: boolean) => void,  
    onSetIsItalic: (item: boolean) => void,  
    onSetIsUnderline: (item: boolean) => void,  
    onSetIsStrikethrough: (item: boolean) => void, 
    onSetIsSubscript: (item: boolean) => void,  
    onSetIsSuperscript: (item: boolean) => void,
    onEditorStateChange: (item: string) => void, 
}) {
    const scrollerRef = useRef(null)
    const initialConfig = {
        editorState: '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
        namespace: 'Playground',
        onError: (error: Error) => {
        throw error;
        },
        theme: theme,
    };

    return (
        <div style={{width: width, height: height, overflow: "hidden"}}>
            <LexicalComposer initialConfig={initialConfig}>
                <div className={`editor-container`}>
                    <AutoFocusPlugin />
                    <ClearEditorPlugin />
                    <>
                        <RichTextPlugin
                        contentEditable={
                            <div className="editor" style={{overflow: "scroll", width: width, height: height}}>
                                <ContentEditable style={{outline: "none"}}/>
                            </div>
                        }
                        placeholder={<div></div>}
                        ErrorBoundary={LexicalErrorBoundary}
                        />
                        <InitialInsertIntoEditor html={EditorState} />
                        <HorizontalRulePlugin />
                        <TabIndentationPlugin />
                        {/* <StylesPlugin bold={bolded} italic={italic} underline={underlined} strikethrough={strikethrough} selectedFontSize={selectedFontSize} selectedFontStyle={selectedFontStyle} selectedHighlightColor={selectedHighlightColor} selectedTextColor={selectedTextColor} onSetIsBold={onSetIsBold} onSetIsItalic={onSetIsItalic} onSetIsUnderline={onSetIsUnderline} onSetIsStrikethrough={onSetIsStrikethrough} onSetIsSubscript={onSetIsSubscript} onSetIsSuperscript={onSetIsSuperscript} onEditorStateChange={onEditorStateChange} /> */}
                    </>
                </div>
            </LexicalComposer>
        </div>
    );
}