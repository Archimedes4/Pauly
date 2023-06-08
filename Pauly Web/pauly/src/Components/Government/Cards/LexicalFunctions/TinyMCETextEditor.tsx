import React, {useState, useRef, useImperativeHandle, useEffect} from 'react'
import { Editor } from "@tinymce/tinymce-react";
import { TinyMCE } from 'tinymce';
import styles from "./EditorCSS.module.css"

export default React.forwardRef(({text, onSetText, height, width}:{text: string, onSetText: (item: string) => void, height: number, width: number}, ref) => {
    const editorRef = useRef(null);
    const [content, setContent] = useState("This is the initial content of the editor.");
    const [foregroundColor, setForegroundColor] = useState<string>("#ff0000")
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
          }
        }
    }, [])

    function create_UUID(){
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (dt + Math.random()*16)%16 | 0;
            dt = Math.floor(dt/16);
            return (c=='x' ? r :(r&0x3|0x8)).toString(16);
        });
        return uuid;
    }
  
    const log = () => {
      if (editorRef.current) {
        console.log(editorRef.current.getContent());
      }
    };

    const onEditorChange = function (a: string, editor: any) {
      // console.log(a);
      setContent(a);
      onSetText(editor.getContent({ format: "text" }));
      //console.log(editor);
    };

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
            {/* <button onClick={(e) => {
                e.preventDefault()
                editorRef.current.focus()
                editorRef.current.formatter.toggle('bold')
            }}>
                Bold
            </button>
            <button onClick={(e) => {
                e.preventDefault()
                editorRef.current.focus()
                editorRef.current.formatter.register('mycustomformat', {
                    inline: 'span',
                    styles: {color: foregroundColor, fontSize: fontSize}
                });
                editorRef.current.formatter.apply('mycustomformat');
            }}>
                Apply
            </button>
            <input name="myInput" onChange={value => {
                setFontSize(value.currentTarget.value)
            }} value={fontSize}/>
            <input type="color" id="colorpicker" value={foregroundColor} onChange={changeEvent => {setForegroundColor(changeEvent.target.value)}} /> */}
            <Editor
            onEditorChange={onEditorChange}
            //initialValue={content}
            //outputFormat="text"
            
            value={content}
            onInit={(evt, editor) => (editorRef.current = editor)}
            // initialValue="<p>This is the initial content of the editor.</p>"
            onSkinLoadError={() => {
                console.log("Skin Error")
            }}
            init={{
                height: height,
                width: width,
                // iframe_attrs: {
                //     styles: "backgound: blue"
                // },
                menubar: false,
                branding: false,
                statusbar: false,
                // plugins: [
                //     "mentions advlist autolink lists link image charmap print preview anchor",
                //     "searchreplace visualblocks code fullscreen",
                //     "insertdatetime media paste code help wordcount",
                // ],
                toolbar: false,
                skin: "/Main",
                content_style: "body { background-color: rgba(0,0,0,0); padding: none; margin: none !important; border: none; font-family: 'Josefin Sans', sans-serif; line-height: 1.4; } p {margin: 0}",
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
