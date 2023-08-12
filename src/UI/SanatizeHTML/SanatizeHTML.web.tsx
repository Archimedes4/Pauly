import { View, Text } from 'react-native'
import React from 'react'
import sanitizeHtml from 'sanitize-html';

export default function SanatizeHTML({html}:{html: string}) {
    const defaultOptions = {
        allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'p' ],
        allowedAttributes: {
          'a': [ 'href' ]
        },
        allowedIframeHostnames: ['www.youtube.com']
    };
      
    function sanitize(dirty: string) {
        const clean: string = sanitizeHtml(
          dirty, 
          {
            allowedTags: ['b', 'i', 'em', 'strong', 'a'],
            allowedAttributes: {
              a: ['href', 'target']
            }
          }
        )
        return {__html: clean}
    }
  return (
    <div dangerouslySetInnerHTML={sanitize(html)} />
  )
}