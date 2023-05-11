import React from 'react'
import { Link } from "react-router-dom"
import { Editor } from '@tinymce/tinymce-react';


export default function Home() {

  return(
    <div style={{width: "100vw", height: "100vh"}}>
      <p>Home</p>
      <Link to="/Government">  Government </Link>
    </div>
  );
}


      {/* <button onClick={handleBoldToggle}>Bold</button> */}
      {/* <div style={{ border: "5px solid red", width: "400px", height: "400px", overflow: "hidden"}}>
        <Editor
          onInit={(evt, editor) => editorRef.current = editor}
          initialValue="<p>This is the initial content of the editor.</p>"
          init={{
            height: 500,
            menubar: false,
            plugins: [
              'advlist autolink lists link image charmap print preview anchor',
              'searchreplace visualblocks code fullscreen',
              'insertdatetime media table paste code help wordcount'
            ],
            toolbar: 'undo redo | formatselect | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
          }}
        />
      </div> */}