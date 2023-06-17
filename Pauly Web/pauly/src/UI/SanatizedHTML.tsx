import React from 'react'
import sanitizeHtml from 'sanitize-html';

export default function RenderHTML({value}:{value: string}) {
  const clean = sanitizeHtml(value, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a'],
    allowedAttributes: {
      a: ['href', 'target']
    }
  });
  return (
    <div 
      dangerouslySetInnerHTML={{__html: clean}}
    />
  );
};