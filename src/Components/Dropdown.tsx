/*
  Pauly
  Andrew Mainella
  November 9 2023
  Dropdown.tsx
*/
/* eslint-disable react/require-default-props */
import { View, Text, Pressable, StyleProp, ViewStyle } from 'react-native';
import React, { ReactNode, useEffect, useState } from 'react';
import { Colors } from '@constants';

// On set selected index returns 0 for the first child that is passed down

export default function Dropdown({
  children,
  onSetSelectedIndex,
  style,
  selectedIndex,
  expandedStyle,
  options,
  setExpanded,
  expanded,
}: {
  children: ReactNode;
  selectedIndex: number;
  onSetSelectedIndex: (item: number) => void;
  style?: StyleProp<ViewStyle> | undefined;
  expandedStyle?: StyleProp<ViewStyle> | undefined;
  options?: string[] | undefined;
  setExpanded?: undefined | ((item: boolean) => void);
  expanded?: boolean | undefined;
}) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  useEffect(() => {
    if (expanded !== undefined) {
      setIsExpanded(expanded);
    }
  }, [expanded]);
  if (isExpanded) {
    return (
      <View style={[expandedStyle, { position: 'absolute' }]}>
        {options ? (
          <>
            {options.map((option, index) => (
              <Pressable
                key={`Option_${index}`}
                onPress={() => {
                  onSetSelectedIndex(index);
                  setIsExpanded(false);
                  if (setExpanded) {
                    setExpanded(false);
                  }
                }}
                style={{borderWidth: 2, borderColor: Colors.black}}
              >
                <Text>{option}</Text>
              </Pressable>
            ))}
          </>
        ) : (
          <>
            {React.Children.map(children, (child, index) => (
              <Pressable
                key={`Option_${index}`}
                onPress={() => {
                  onSetSelectedIndex(index);
                  setIsExpanded(false);
                  if (setExpanded) {
                    setExpanded(true);
                  }
                }}
              >
                {child}
              </Pressable>
            ))}
          </>
        )}
      </View>
    );
  }
  if (options) {
    return (
      <Pressable
        onPress={() => {
          setIsExpanded(true);
          if (setExpanded) {
            setExpanded(true);
          }
        }}
        style={style}
      >
        <Text>{options[selectedIndex]}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={() => {
        setIsExpanded(true);
        if (setExpanded) {
          setExpanded(true);
        }
      }}
      style={style}
    >
      {React.Children.toArray(children)[selectedIndex]}
    </Pressable>
  );
}
