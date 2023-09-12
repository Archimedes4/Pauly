import { View, Text, Pressable, StyleProp, ViewStyle } from 'react-native'
import React, { Children, ReactNode, useEffect, useState } from 'react'

//On set selected index returns 0 for the first child that is passed down

export default function Dropdown({children, onSetSelectedIndex, style, selectedIndex, expandedStyle, options, setExpanded, expanded}:{children: ReactNode, selectedIndex: number, onSetSelectedIndex: (item: number) => void, style?: StyleProp<ViewStyle>, expandedStyle?: StyleProp<ViewStyle>, options?: string[], setExpanded?: (item: boolean) => void, expanded?: boolean}) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  useEffect(() => {
    if (expanded !== undefined) {
      setIsExpanded(expanded)
    }
  }, [expanded])
  return (
    <>
      { isExpanded ?
        <View style={[expandedStyle, {position: "absolute"}]}>
          { (options) ? 
            <>
              { options.map((option, index) => (
                <Pressable key={"Option_"+index} onPress={() => {
                  onSetSelectedIndex(index);
                  setIsExpanded(false)
                  if (setExpanded) {
                    setExpanded(false)
                  }
                }}>
                  <Text>{option}</Text>
                </Pressable>
              ))}
            </>:
            <>
              {
                React.Children.map(children, (child, index) =>      
                  <Pressable key={"Option_"+index} onPress={() => {onSetSelectedIndex(index); setIsExpanded(false)
                    if (setExpanded) {
                      setExpanded(true)
                    }
                  }}>
                    <React.Fragment>
                      {child}
                    </React.Fragment>
                  </Pressable>
                )
              }
            </>
          }
        </View>
        :
        <Pressable onPress={() => {
          setIsExpanded(true)
          if (setExpanded) {
            setExpanded(true)
          }
        }} style={style}>
          { options ?
            <Text>{options[selectedIndex]}</Text>:
            <React.Fragment>
              {children[selectedIndex]}
            </React.Fragment>
          }
        </Pressable>
      }
    </>
  )
}