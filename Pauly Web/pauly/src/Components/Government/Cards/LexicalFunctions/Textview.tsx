import React, {useEffect, useState} from 'react'
import 'react-quill/dist/quill.snow.css';

import ReactQuill from 'react-quill'
import { format } from 'path';
export default function Textview({text}:{text: string}) {
    const modules = {
        toolbar: false
    }
    const [scrollPosition, setScrollPosition] = useState(0);
    const handleScroll = () => {
        const position = window.pageYOffset;
        setScrollPosition(position);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
  return (
    <div style={{width: "100%", height: "100%", overflow: "hidden"}}>
        <ReactQuill
            value={text}
            style={{width: "100%", height: "100%"}}
            theme='snow'
            readOnly={true}
            modules={modules}
            // formats={formats}
        />
    </div>
  )
}
