/*
  Pauly
  Andrew Mainella
  13 January 2024
  StyledButton.tsx
  A default button for consistancy and eas of use.
*/
import {
  Text,
  Pressable,
  ViewStyle,
  StyleProp,
  TextStyle,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { Colors } from '@constants';

interface StyledTextButtonProps {
  text: string;
  caption?: string | undefined;
  to?: string;
  onPress?: () => void;
  style?: ViewStyle | undefined;
  second?: boolean;
  selected?: boolean;
  textStyle?: StyleProp<TextStyle>;
  children?: undefined;
  mainColor?: string;
  altColor?: string;
  icon?: (alt: boolean) => React.ReactNode;
}

interface StyledChildButtonProps {
  children: React.ReactNode;
  caption?: string | undefined;
  to?: string;
  onPress?: () => void;
  style?: ViewStyle | undefined;
  second?: boolean;
  selected?: boolean;
  textStyle?: StyleProp<TextStyle>;
  text?: undefined;
  mainColor?: string;
  altColor?: string;
  icon?: undefined;
}

function getBackgroundColor(
  isAlt: boolean,
  selected?: boolean,
  second?: boolean,
  mainColor?: string,
  altColor?: string,
) {
  if (second === true && isAlt && selected !== true) {
    return altColor || Colors.lightGray;
  }
  if (second === true && selected !== true) {
    return mainColor || Colors.darkGray;
  }
  if (isAlt && selected !== true) {
    return altColor || Colors.black;
  }
  if (isAlt && selected === true) {
    return altColor || Colors.black;
  }
  if (selected === true) {
    return Colors.blueGray;
  }
  return mainColor || Colors.lightGray;
}

function getTextColor(isAlt: boolean, selected?: boolean, second?: boolean) {
  if (second === true && isAlt && selected !== true) {
    return Colors.black;
  }
  if (second === true && selected !== true) {
    return Colors.white;
  }
  if (isAlt && selected !== true) {
    return Colors.white;
  }
  if (isAlt && selected === true) {
    return Colors.white;
  }
  if (selected === true) {
    return Colors.white;
  }
  return Colors.black;
}

function getHeight(text?: string, caption?: string) {
  if (text !== undefined && caption !== undefined) {
    return 52;
  }
  if (text !== undefined) {
    return 40;
  }
}

export default function StyledButton({
  to,
  text,
  children,
  caption,
  onPress,
  style,
  second,
  selected,
  textStyle,
  mainColor,
  altColor,
  icon,
}: StyledTextButtonProps | StyledChildButtonProps) {
  const [isAlt, setIsAlt] = useState<boolean>(false);
  if (typeof to === 'string') {
    return (
      <Pressable
        onHoverIn={() => setIsAlt(true)}
        onHoverOut={() => setIsAlt(false)}
        onPressIn={() => setIsAlt(true)}
        onPressOut={() => setIsAlt(false)}
        onPress={() => {
          router.push(to);
          if (onPress !== undefined) {
            onPress();
          }
        }}
        style={[
          {
            shadowColor: Colors.black,
            shadowOffset: { width: 2, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            flex: text !== undefined ? undefined : 1,
            borderRadius: 12,
          },
          style,
        ]}
      >
        <View
          style={{
            backgroundColor: getBackgroundColor(
              isAlt,
              selected,
              second,
              mainColor,
              altColor,
            ),
            borderRadius: 12,
            height: getHeight(text, caption),
            overflow: 'hidden',
            padding: 10,
          }}
        >
          {children ? (
            <>{children}</>
          ) : (
            <>
              <Text
                style={[
                  {
                    fontSize: 16,
                    color: getTextColor(isAlt, selected, second),
                    fontFamily: 'Roboto',
                    height: 20,
                  },
                  textStyle,
                ]}
              >
                {text}
              </Text>
              {caption !== undefined ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: getTextColor(isAlt, selected, second),
                    fontFamily: 'Roboto',
                  }}
                >
                  {caption}
                </Text>
              ) : null}
            </>
          )}
        </View>
      </Pressable>
    );
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
          backgroundColor: getBackgroundColor(
            isAlt,
            selected,
            second,
            mainColor,
            altColor,
          ),
          shadowColor: Colors.black,
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          borderRadius: 12,
          padding: 10,
          height:
            text !== undefined ? (caption !== undefined ? 48 : 36) : undefined,
          flex: text !== undefined ? undefined : 1,
        },
        style,
      ]}
    >
      {children ? (
        <>{children}</>
      ) : (
        <>
          <View style={{ flexDirection: 'row' }}>
            {icon !== undefined ? icon(isAlt) : null}
            <Text
              style={[
                {
                  fontSize: 16,
                  color: getTextColor(isAlt, selected, second),
                  fontFamily: 'Roboto',
                  height: 20,
                },
                textStyle,
              ]}
            >
              {text}
            </Text>
          </View>
          {caption !== undefined ? (
            <Text
              style={{
                fontSize: 12,
                color: getTextColor(isAlt, selected, second),
                fontFamily: 'Roboto',
              }}
            >
              {caption}
            </Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
}
