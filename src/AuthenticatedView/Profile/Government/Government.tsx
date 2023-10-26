import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  Pressable,
} from 'react-native';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useSelector } from 'react-redux';
import {
  BookIcon,
  CalendarIcon,
  GearIcon,
  GraduationHatIcon,
  GraphAPILogo,
  HomeIcon,
  MedalIcon,
  StudentSearchIcon,
} from '../../../UI/Icons/Icons';
import { RootState } from '../../../Redux/store';
import { Colors } from '../../../types';

function Block({
  height,
  width,
  text,
  imageSource,
  children,
  onPress,
}: {
  height: number;
  width: number;
  text: string;
  imageSource?: ImageSourcePropType;
  children?: ReactNode;
  onPress: () => void
}) {
  const [isSelected, setIsSelected] = useState<boolean>(false)
  return (
    <Pressable
      style={{
        height,
        width,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isSelected ? Colors.lightGray:Colors.darkGray,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
      }}
      onHoverIn={() => {setIsSelected(true)}}
      onHoverOut={() => {setIsSelected(false)}}
      onPress={() => onPress()}
    >
      {imageSource !== undefined && (
        <Image
          source={imageSource}
          style={{ width: width * 0.5, height: height * 0.5 }}
          resizeMode="center"
        />
      )}
      {imageSource === undefined && children !== undefined && (
        <View style={{ width: width * 0.5, height: height * 0.5 }}>
          <>{children}</>
        </View>
      )}
      <Text style={{ color: isSelected ? Colors.black:Colors.white }}>{text}</Text>
    </Pressable>
  );
}

export default function Government() {
  const { width, height, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const isGovernmentMode = useSelector(
    (state: RootState) => state.isGovernmentMode,
  );
  const navigate = useNavigate();
  useEffect(() => {
    if (!isGovernmentMode) {
      navigate('/');
    }
  }, []);
  const [fontsLoaded] = useFonts({
    BukhariScript: require('../../../../assets/fonts/BukhariScript.ttf'),
  });
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const [mainWidth, setMainWidth] = useState<number>(0);
  useEffect(() => {
    const fivePercent = width * 0.05;
    const remainder = (width * 0.8) % (100 + fivePercent);
    setMainWidth(width * 0.8 - remainder - fivePercent);
  }, [width]);
  if (!fontsLoaded) {
    return null;
  }
  return (
    <View style={{ height, width, backgroundColor: Colors.white }}>
      {currentBreakPoint <= 0 ? (
        <Pressable onPress={() => navigate('/profile/')}>
          <Text>Back</Text>
        </Pressable>
      ) : null}
      <View
        style={{
          height: height * 0.2,
          width,
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={{
            fontFamily: 'BukhariScript',
            fontSize: height * 0.09,
            height: height * 0.13,
            width: width * 0.8,
            textAlign: 'center',
            textAlignVertical: 'center',
            verticalAlign: 'middle',
          }}
        >
          Government
        </Text>
      </View>
      <View
        style={{
          height: height * 0.75,
          width,
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: height * 0.05,
        }}
      >
        <View
          style={{
            height: height * 0.75,
            width: mainWidth,
            flexDirection: 'row',
            alignContent: 'flex-start',
            flexWrap: 'wrap',
            rowGap: height * 0.05,
            columnGap: width * 0.05,
          }}
        >
          <Block onPress={() => navigate('/profile/government/graph/list')} width={100} height={100} text="Graph">
            <GraphAPILogo width={50} height={50} />
          </Block>
          <Block onPress={() => navigate('/profile/government/commissions')} width={100} height={100} text="Commissions">
            <MedalIcon width={50} height={50} />
          </Block>
          <Block
            width={100}
            height={100}
            text="Sports"
            imageSource={require('../../../../assets/images/Football.png')}
            onPress={() => navigate('/profile/government/sports')}
          />
          <Block onPress={() => navigate('/profile/government/homepage')} width={100} height={100} text="Homepage">
            <HomeIcon width={50} height={50} />
          </Block>
          <Block onPress={() => navigate('/profile/government/calendar')} width={100} height={100} text="Calendar">
            <CalendarIcon width={50} height={50} />
          </Block>
          <Block onPress={() => navigate('/profile/government/classes')} width={100} height={100} text="Classes">
            <GraduationHatIcon width={50} height={50} />
          </Block>
          <Block onPress={() => navigate('/profile/government/admin')} width={100} height={100} text="Admin">
            <GearIcon width={50} height={50} />
          </Block>
          <Block onPress={() => navigate('/profile/government/resources')} width={100} height={100} text="Resources">
            <BookIcon width={50} height={50} />
          </Block>
          <Block onPress={() => navigate('/profile/government/students')} width={100} height={100} text="Students">
            <StudentSearchIcon width={50} height={50} />
          </Block>
        </View>
      </View>
    </View>
  );
}
