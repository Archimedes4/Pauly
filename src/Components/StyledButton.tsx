/*
  Pauly
  Andrew Mainella
*/
import { Text, Pressable, ViewStyle } from 'react-native';
import React, { useState } from 'react';
import { Link } from 'expo-router';
import { Colors } from '../constants';

interface StyledButtonProps {
  text: string;
  caption?: string | undefined;
  to?: string;
  onPress?: (() => void);
  style?: ViewStyle | undefined;
  second?: boolean
}

export default function StyledButton({
  to,
  text,
  caption,
  onPress,
  style,
  second,
}: StyledButtonProps) {
  const [isAlt, setIsAlt] = useState<boolean>(false);
  if (typeof to === 'string') {
    return (
      <Link href={to} style={[
        {
          backgroundColor: ((second === true) ? isAlt:!isAlt) ? Colors.lightGray:Colors.darkGray,
          shadowColor: Colors.black,
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          borderRadius: 15,
          height: 36
        },
        style,
      ]}>
        <Pressable
          onHoverIn={() => setIsAlt(true)}
          onHoverOut={() => setIsAlt(false)}
          onPressIn={() => setIsAlt(true)}
          onPressOut={() => setIsAlt(false)}
          onPress={() => {
            if (onPress !== undefined) {
              onPress();
            }
          }}
          style={{ padding: 10, width: '100%'}}
        >
          <Text style={{ fontSize: 16, color: ((second === true) ? isAlt:!isAlt) ? Colors.black:Colors.white, fontFamily: 'Roboto' }}>{text}</Text>
          {caption !== undefined ? (
            <Text style={{ fontSize: 12 }}>{caption}</Text>
          ) : null}
        </Pressable>
      </Link>
    )
  }
  return (
    <Pressable
      onHoverIn={() => setIsAlt(true)}
      onHoverOut={() => setIsAlt(false)}
      onPressIn={() => setIsAlt(true)}
      onPressOut={() => setIsAlt(false)}
      onPress={() => {
        if (onPress !== undefined) {
          onPress();
        }
      }}
      style={[
        {
          backgroundColor: isAlt ? Colors.lightGray:Colors.darkGray,
          shadowColor: Colors.black,
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          borderRadius: 15,
          padding: 10,
          height: 36
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 16, color: isAlt ? Colors.black:Colors.white, fontFamily: 'Roboto' }}>{text}</Text>
      {caption !== undefined ? (
        <Text style={{ fontSize: 12 }}>{caption}</Text>
      ) : null}
    </Pressable>
  );
}
