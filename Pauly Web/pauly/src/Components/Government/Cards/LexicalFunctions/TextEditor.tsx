import React, {useEffect, useImperativeHandle, useRef, useState} from 'react'
import ReactQuill, {Quill} from 'react-quill'
import { DeltaStatic, Sources } from 'quill'
import 'react-quill/dist/quill.snow.css';
import "react-quill/dist/quill.core.css";

export default React.forwardRef(({selected, onSetIsUserTyping, text, onSetText, selectedColor, selectedSize}:{selected: boolean, onSetIsUserTyping: (item: boolean) => void, text: string, onSetText: (item: string) => void, selectedColor: string, selectedSize: string}, ref)  => {
    const boldRef = useRef(null)
    const italicRef = useRef(null)
    const underlineRef = useRef(null)
    const strikethroughRef = useRef(null)
    const sizeRef = useRef(null)
    
    useImperativeHandle(ref, () => {
      return {
        bold (){
          boldRef.current.click()
        },
        italic (){
          italicRef.current.click()
        },
        underline () {
          underlineRef.current.click()
        },
        strikethrough () {
          strikethroughRef.current.click()
        }
      }
    }, [])



    // useEffect(() => {
      
    // }, [selectedSize])

    const handleChange= (value: string, delta: DeltaStatic, source: Sources, editor: ReactQuill.UnprivilegedEditor)=> {
      console.log(value)
      console.log(delta)
      console.log(source)
      console.log(editor)
      
      onSetText(value);
    }

    const modules = {
        toolbar: {
          container:  "#toolbar"
        }
    }
    const formats = [
      'font',
      'size',
      'bold',
      'italic',
      'underline',
      'strike',
      'color',
      'background',
      'direction',
      'align',
      'link',
      'formula'
    ]

    useEffect(() => {
      const Size = ReactQuill.Quill.import("formats/size");
      Size.whitelist = ["extra-small", "small", "medium", "large"];
      ReactQuill.Quill.register(Size, true);
    }, [])


    
    return (
      <div  className="text-editor" style={{height: "100%", width: "100%"}}>
        <div id="toolbar" style={{display: "block"}}>
          <button ref={boldRef} className="ql-bold" onClick={(e) => {e.preventDefault()}} />
          <button ref={italicRef} className="ql-italic" onClick={(e) => {e.preventDefault()}} />
          <button ref={underlineRef} className="ql-underline" onClick={(e) => {e.preventDefault()}} />
          <button ref={strikethroughRef} className="ql-strike" onClick={(e) => {e.preventDefault()}}/>
          <select className="ql-size" defaultValue="medium">
            <option value="extra-small">Size 1</option>
            <option value="small">Size 2</option>
            <option value="medium">Size 3</option>
            <option value="large">Size 4</option>
          </select>
          <select className="ql-color" value={selectedColor} />
          <select className="ql-background" />
          <button onClick={() => {
            console.log(text)
          }}>
            Log
          </button>
        </div>
        <ReactQuill
          value={text}
          onChange={(value, delta, source, editor) => {handleChange(value, delta, source, editor)}}
          modules={modules}
          style={{width: "100%", height: "100%"}}
          theme='snow'
          readOnly={!selected}
          onBlur={() => {onSetIsUserTyping(false)}}
          onFocus={() => {onSetIsUserTyping(true)}}
        /> 
          {/* <div />
        </ReactQuill> */}
      </div>
    )
})
