import { View, Text, Pressable, StyleProp, ViewStyle } from 'react-native'
import React, { Children, ReactNode, useState } from 'react'

//On set selected index returns 0 for the first child that is passed down

export default function Dropdown({children, onSetSelectedIndex, style, selectedIndex, expandedStyle}:{children: ReactNode, selectedIndex: number, onSetSelectedIndex: (item: number) => void, style?: StyleProp<ViewStyle>, expandedStyle?: StyleProp<ViewStyle>}) {
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const [height, setheight] = useState<number>(0)
    return (
    <View style={{zIndex: 100, position: "relative"}}>
        { isExpanded ?
            <View>
                <View style={style}/>
                <View style={[expandedStyle, {position: "absolute", zIndex: 100}]}>
                {
                    React.Children.map(children, (child, index) =>
                    <View>
                        <Pressable onPress={() => {onSetSelectedIndex(index); setIsExpanded(false)}}>
                            <React.Fragment>
                                {child}
                            </React.Fragment>
                        </Pressable>
                    </View>
                    )
                }
                </View>
            </View>:
            <Pressable onPress={() => {setIsExpanded(true)}} style={style}>
                <React.Fragment>
                    {children[selectedIndex]}
                </React.Fragment>
            </Pressable>
        }
    </View>
  )
}