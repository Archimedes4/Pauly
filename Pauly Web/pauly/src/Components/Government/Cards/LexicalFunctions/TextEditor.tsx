import React, {useEffect, useImperativeHandle, useRef, useState} from 'react'
import ReactQuill from 'react-quill'
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

    const handleChange= (html: string)=> {
      onSetText(html);
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
      var Size = ReactQuill.Quill.import('attributors/style/size');
      Size.whitelist = ["8px", "12px", "14px", "16px", "20px", "24px"]
      ReactQuill.Quill.register(Size, true);
      const qlstroke = document.getElementsByClassName(".ql-stroke");
    }, [])


    
    return (
      <div  className="text-editor" style={{height: "100%", width: "100%"}}>
        <div id="toolbar" style={{display: "block"}}>
          <button ref={boldRef} className="ql-bold" onClick={(e) => {e.preventDefault()}} />
          <button ref={italicRef} className="ql-italic" onClick={(e) => {e.preventDefault()}} />
          <button ref={underlineRef} className="ql-underline" onClick={(e) => {e.preventDefault()}} />
          <button ref={strikethroughRef} className="ql-strike" onClick={(e) => {e.preventDefault()}}/>
          <select className="ql-size" defaultValue={selectedSize}>
            <option value={selectedSize}/>
          </select>
          <select className="ql-color" value={selectedColor} />
          <select className="ql-background" />

        </div>
        <ReactQuill
          value={text}
          onChange={handleChange}
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
