import React, {useState, useRef, useImperativeHandle, useEffect} from 'react'
import { Editor } from "@tinymce/tinymce-react";
import { TinyMCE } from 'tinymce';
import styles from "./EditorCSS.module.css"
import "tinymce/skins/ui/tinymce-5/skin.min.css"
import "tinymce/skins/ui/tinymce-5/content.min.css"
import "tinymce/icons/default/icons.min.js"
import "tinymce/models/dom/model.min.js"
import "tinymce/themes/silver/theme.min.js"
import "./EditorSkin.css"
import {create_UUID} from "../../../Functions/CreateUUID"

export default React.forwardRef(({text, onSetText, height, width}:{text: string, onSetText: (item: string) => void, height: number, width: number}, ref) => {
    const editorRef = useRef(null);
    const [foregroundColor, setForegroundColor] = useState<string>("#ff0000")
    const [backgroundColor, setBackgorundColor] = useState<string>("#ff0000")
    const [selectedFont, setSelectedFont] = useState<string>("Times New Roman")
    const [fontSize, setFontSize] = useState<string>("12px")

    useImperativeHandle(ref, () => {
        return {
          bold (){
            editorRef.current.focus()
            editorRef.current.formatter.toggle('bold')
          },
          italic (){
            editorRef.current.focus()
            editorRef.current.formatter.toggle('italic')
          },
          underline () {
            editorRef.current.focus()
            editorRef.current.formatter.toggle('underline')
          },
          strikethrough () {
            editorRef.current.focus()
            editorRef.current.formatter.toggle('strikethrough')
          },
          setForegroundColorRef (value: string) {
            setForegroundColor(value)
          },
          setFontSizeRef (value: string) {
            setFontSize(value)
          }
        }
    }, [])
  
    const log = () => {
      if (editorRef.current) {
        console.log(editorRef.current.getContent());
      }
    };

    const onEditorChange = function (a: string, editor: any) {
        onSetText(a);
        console.log(a)
    };

    useEffect(() => {
      const newID = create_UUID()
      editorRef.current?.formatter.register(newID, {
        inline: 'span',
        styles: {
          backgroundColor: backgroundColor,
          fontSize: fontSize,
          foregroundColor: foregroundColor,
          fontFamily: selectedFont
        }
      });
     
      editorRef.current?.formatter.apply(newID);
    }, [foregroundColor, backgroundColor, selectedFont, fontSize])

    useEffect(() => {
        console.log(editorRef.current)
        console.log(editorRef.current?.iframeHTML)
        console.log(editorRef.current?.iframeElement?.style)
        if (editorRef.current?.iframeElement?.style !== undefined) {
            editorRef.current.iframeElement.style.backgroundColor = "transparent"
            editorRef.current.iframeElement.style.border = "none"
        }
        console.log(editorRef.current?.iframeElement?.style)
    }, [editorRef.current])
    
    return (
        <div>
            <Editor
            onEditorChange={onEditorChange}
            value={text}
            onInit={(evt, editor) => (editorRef.current = editor)}
            onSkinLoadError={() => {
                console.log("Skin Error")
            }}
            init={{
                height: height,
                width: width,
                menubar: false,
                branding: false,
                statusbar: false,
                base_url: "tinymce/",
                toolbar: false,
                skin: "tinymce-5",
                content_style: "body { background-color: rgba(0,0,0,0); padding: none; margin: 0 !important; border: none; } p {margin: 0}",
                emoticons_append: {
                    custom_mind_explode: {
                    keywords: ["brain", "mind", "explode", "blown"],
                    char: "🤯",
                    },
                },
            }}
        />
        </div>
    )
})
