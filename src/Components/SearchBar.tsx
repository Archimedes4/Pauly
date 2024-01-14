/*
  Pauly
  Andrew Mainella
  SearchBar.tsx
  A Search Bar component
*/
import { RootState } from '@redux/store';
import { Colors } from '@constants';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  TextInput,
  View,
  Text,
  StyleProp,
  TextStyle,
} from 'react-native';
import { useSelector } from 'react-redux';
import { SearchIcon } from './Icons';

export default function SearchBar({
  value,
  onChangeText,
  onSearch,
  top,
}: {
  value: string;
  onChangeText: (change: string) => void;
  onSearch: () => void;
  top?: number;
}) {
  // Dimensions
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false); // Boolean true if text overflowing. This is telling the search icon to show or not.
  const style: StyleProp<TextStyle> =
    // @ts-expect-error: web platform has a needs a style not support in native
    Platform.OS === 'web' ? { outlineStyle: 'none' } : undefined; // Style to remove ourline around textbox on web

  // Getting search results on value chage
  useEffect(() => {
    if (mounted) {
      const timeOutId = setTimeout(() => onSearch(), 500);
      return () => clearTimeout(timeOutId);
    }
    setMounted(true); // Setting that it has been called on start
  }, [value]);

  return (
    <View
      key="Search_View_Top"
      style={{
        width,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: top || height * 0.1 - 19,
        zIndex: 2,
      }}
    >
      <View
        key="Search_View_Mid"
        style={{
          width: width * 0.8,
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          borderRadius: 25,
          flexDirection: 'row',
          backgroundColor: Colors.white,
        }}
      >
        {isOverflowing ? null : (
          <View
            key="Search_View_Search_Icon"
            style={{
              width: 20,
              height: 40,
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 10,
            }}
          >
            <SearchIcon key="Search_Icon" width={15} height={15} />
          </View>
        )}
        <View key="Search_View_Input">
          <TextInput
            key="Search_TextInput"
            placeholder="Search"
            placeholderTextColor={Colors.black}
            value={value}
            onChangeText={onChangeText}
            style={[
              {
                width: isOverflowing ? width * 0.8 - 20 : width * 0.8 - 50,
                height: 20,
                margin: 10,
                borderWidth: 0,
              },
              style,
            ]}
            enterKeyHint="search"
            inputMode="search"
          />
          <View
            style={{ height: 0, alignSelf: 'flex-start', overflow: 'hidden' }}
            onLayout={e => {
              if (e.nativeEvent.layout.width > width * 0.8 - 20) {
                setIsOverflowing(true);
              } else {
                setIsOverflowing(false);
              }
            }}
            key="Search_View_Text"
          >
            <Text style={{ color: 'white' }}>{value}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
