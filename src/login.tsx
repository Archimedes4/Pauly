import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, Pressable, Image } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootState } from './Redux/store';
import { safeAreaColorsSlice } from './Redux/reducers/safeAreaColorsReducer';
import { GearIcon } from './UI/Icons/Icons';
import { Colors } from './types';

export default function Login({
  onGetAuthToken,
  onGetGovernmentAuthToken,
  width,
}: {
  onGetAuthToken: () => void;
  onGetGovernmentAuthToken: () => void;
  width: number;
}) {
  const { height } = useSelector((state: RootState) => state.dimentions);
  const [isBottonHover, setIsButtonHover] = useState<boolean>(false);
  const [isGovernmentHover, setIsGovernmentHover] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(0);
  const [isShowingGovernmentLogin, setIsShowingGovernmentLogin] =
    useState<boolean>(false);
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  useCallback(
    async function setSafeAreaColors() {
      dispatch(safeAreaColorsSlice.actions.setSafeAreaColorTop(Colors.maroon));
      dispatch(
        safeAreaColorsSlice.actions.setSafeAreaColorBottom(Colors.maroon),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    const heightIsGreater: boolean = width < height;
    if (heightIsGreater) {
      setFontSize(width / 4);
    } else {
      setFontSize(height / 3);
    }
  }, [height, width]);
  // Font
  const [fontsLoaded] = useFonts({
    BukhariScript: require('../assets/fonts/BukhariScript.ttf'),
    'Gochi Hand': require('../assets/fonts/GochiHand-Regular.ttf'),
  });

  useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Pressable
      style={{
        backgroundColor: Colors.maroon,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        height,
        width,
        overflow: 'hidden',
        top: -insets.top,
      }}
      onLongPress={() => {
        setIsShowingGovernmentLogin(true);
      }}
      delayLongPress={5000}
    >
      <View
        id="Content_Area"
        style={{
          width: width < height ? width : height,
          height: width < height ? width : height,
          alignItems: 'center',
          justifyContent: 'center',
          alignContent: 'center',
        }}
      >
        <View
          style={{
            width: fontSize * 1.65,
            height: fontSize,
            flexDirection: 'row',
          }}
          id="Text_Container"
        >
          <Image
            source={require('../assets/images/PaulyLogo.png')}
            resizeMode="contain"
            style={{
              width: fontSize,
              height: fontSize,
              position: 'absolute',
              left: -fontSize * 0.2,
            }}
          />
          <Text
            style={{
              position: 'absolute',
              left: fontSize * 0.5,
              top: fontSize * 0.22,
              fontFamily: 'Gochi Hand',
              fontSize: fontSize - fontSize / 3,
              textShadowColor: 'rgba(0, 0, 0, 1)',
              textShadowOffset: { width: 4, height: 5 },
              textShadowRadius: 0,
              color: Colors.white,
            }}
            selectable={false}
          >
            auly
          </Text>
        </View>
        <Text
          style={{ color: 'white', marginTop: 25, fontFamily: 'BukhariScript' }}
        >
          23/24 Saint Paul's High School Student Council
        </Text>
        <Pressable
          onPress={async () => {
            onGetAuthToken();
          }}
          onHoverIn={() => {
            setIsButtonHover(true);
          }}
          onHoverOut={() => {
            setIsButtonHover(false);
          }}
          style={{
            height: height * 0.09,
            width: width * 0.5,
            borderRadius: 50,
            backgroundColor: isBottonHover ? Colors.darkGray : Colors.white,
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: isBottonHover ? Colors.white : 'black',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            marginTop: width < height ? width * 0.05 : height * 0.05,
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: isBottonHover ? Colors.white : 'black',
              fontWeight: 'bold',
            }}
          >
            LOGIN
          </Text>
        </Pressable>
        {isShowingGovernmentLogin ? (
          <Pressable
            onPress={async () => {
              onGetGovernmentAuthToken();
            }}
            onHoverIn={() => {
              setIsGovernmentHover(true);
            }}
            onHoverOut={() => {
              setIsGovernmentHover(false);
            }}
            style={{
              height: height * 0.09,
              width: width * 0.5,
              borderRadius: 50,
              backgroundColor: isGovernmentHover
                ? Colors.darkGray
                : Colors.white,
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: isBottonHover ? Colors.white : 'black',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
              marginTop: width < height ? width * 0.1 : height * 0.1,
              flexDirection: 'row',
            }}
          >
            <GearIcon width={18} height={18} />
            <Text
              style={{
                textAlign: 'center',
                color: isBottonHover ? Colors.white : 'black',
                fontWeight: 'bold',
              }}
            >
              LOGIN AS ADMIN
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}
