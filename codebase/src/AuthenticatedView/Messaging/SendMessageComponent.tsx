import { View, Text, TextInput, TextInputKeyPressEventData, NativeSyntheticEvent, Pressable } from 'react-native'
import React, { useState } from 'react'
import Editor from './LexicalEditor.web/LexicalEditor.web'
import Svg, { Path } from 'react-native-svg'

// import { RichEditor } from 'react-native-pell-rich-editor'

export default function SendMessageComponent({onSend, width, height}:{onSend: (item: string) => void, width: number, height: number}) {
    const [newMessageText, setNewMessageText] = useState<string>("")
  return (
    <View style={{flexDirection: "row", width: width, height: height}}>
        {/* <TextInput 
          value={newMessageText}
          onChangeText={setNewMessageText}
          onKeyPress={(e: NativeSyntheticEvent<TextInputKeyPressEventData>)  => {console.log(e.type)}}
        /> */}
        {/* <RichEditor onChange={(e) => {console.log(e)}}/> */}
        <Editor 
          width={width - height}
          height={height} 
          EditorState={newMessageText} 
          bolded={false}
          italic={false}
          underlined={false}
          strikethrough={false}
          selectedFontSize={"12px"}
          selectedFontStyle={"12px"}
          selectedHighlightColor={"12px"}
          selectedTextColor={"12px"}
          onSetIsBold={() => {}}
          onSetIsItalic={() => {}}  
          onSetIsUnderline={() => {}}
          onSetIsStrikethrough={() => {}}
          onSetIsSubscript={() => {}}
          onSetIsSuperscript={() => {}}
          onEditorStateChange={() => {}}
        />
        <View style={{width: height, height: height}}>
          <Pressable onPress={() => {
              onSend(newMessageText)
          }}>
            <Svg style={{width: height, height: height, position: "absolute", zIndex: 2}} viewBox="0 0 24 24" id="up-arrow">
              <Path d="M17.71,11.29l-5-5a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,1,1,0,0,0-.33.21l-5,5a1,1,0,0,0,1.42,1.42L11,9.41V17a1,1,0,0,0,2,0V9.41l3.29,3.3a1,1,0,0,0,1.42,0A1,1,0,0,0,17.71,11.29Z" />
            </Svg>
            <View style={{position: "absolute", width: height, height: height, backgroundColor: "blue", borderRadius: 50}}/>
          </Pressable>
        </View>
    </View>
  )
}