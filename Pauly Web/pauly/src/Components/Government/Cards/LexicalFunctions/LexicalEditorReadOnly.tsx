import React, { useEffect } from 'react'
import theme from './LexicalTheme';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

export default function LexicalEditorReadOnly({value, width, height, onMount}: {value: string, width: number, height: number, onMount: () => void}) {
    const initialConfig = {
        editorState: value,
        namespace: 'Playground',
        onError: (error: Error) => {
        throw error;
        },
        theme: theme,
    };
    useEffect(() => {
        console.log(value)
        onMount()
      }, [])
    return (
        <div>
            <LexicalComposer initialConfig={initialConfig}>
                <div className={`editor-container`}>
                    <RichTextPlugin
                    contentEditable={
                        <div className="editor" style={{overflow: "scroll", width: width, height: height}}>
                            <ContentEditable style={{outline: "none"}}/>
                        </div>
                    }
                    placeholder={<div></div>}
                    ErrorBoundary={LexicalErrorBoundary}
                    />
                </div>
            </LexicalComposer>
        </div>
    )
}
