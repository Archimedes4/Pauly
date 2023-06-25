import React, { useEffect } from 'react'
import sanitizeHtml from 'sanitize-html';
import "./SanatizedHTMLcss.css"
import "tinymce/skins/ui/tinymce-5/skin.min.css"
import "tinymce/skins/ui/tinymce-5/content.min.css"
import "tinymce/icons/default/icons.min.js"
import "tinymce/models/dom/model.min.js"
import "tinymce/themes/silver/theme.min.js"

export default function RenderHTML({value, onMount}:{value: string, onMount: () => void}) {
  const clean = sanitizeHtml(value, {
    allowedTags: ['p', 'i', 'em', 'strong', 'a'],
    allowedAttributes: {
      a: ['href', 'target']
    }
  });
  useEffect(() => {
    console.log(clean)
    console.log(value)
  }, [clean])

  useEffect(() => {
    onMount()
  }, [])

  return (
    <div 
      dangerouslySetInnerHTML={{__html: clean}}
    />
  );
};