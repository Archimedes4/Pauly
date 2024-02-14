/*
  Pauly
  Andrew Mainella
  20 January 2024
  government/index.tsx
  Government Homepage. Shows navigation to government pages.
*/
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView
} from 'react-native';
import React, { ReactNode, useEffect, useState } from 'react';
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
} from '@components/Icons';
import store, { RootState } from '@redux/store';
import { Colors } from '@constants';
import { router, useRouter } from 'expo-router';
import { safeAreaColorsSlice } from '@redux/reducers/safeAreaColorsReducer';
import BackButton from '@components/BackButton';

function Block({
  height,
  width,
  text,
  imageSource,
  href,
  children,
}: {
  height: number;
  width: number;
  text: string;
  href: string;
  imageSource?: ImageSourcePropType;
  children?: ReactNode;
}) {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  return (
    <Pressable
      style={{
        height,
        width,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isSelected ? Colors.lightGray : Colors.darkGray,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
      }}
      onHoverIn={() => {
        setIsSelected(true);
      }}
      onHoverOut={() => {
        setIsSelected(false);
      }}
      onPress={() => {
        router.push(href)
      }}
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
      <Text style={{ color: isSelected ? Colors.black : Colors.white }}>
        {text}
      </Text>
    </Pressable>
  );
}

export default function Government() {
  const router = useRouter();
  const { width, height, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const isGovernmentMode = useSelector(
    (state: RootState) => state.isGovernmentMode,
  );
  const [mainWidth, setMainWidth] = useState<number>(0);

  useEffect(() => {
    if (!isGovernmentMode) {
      router.push('/');
    }
    store.dispatch(
      safeAreaColorsSlice.actions.setSafeArea({
        top: Colors.white,
        bottom: Colors.white,
        isTopTransparent: false,
        isBottomTransparent: true,
        overflowHidden: true,
      }),
    );
  }, []);

  useEffect(() => {
    const setWidth = (currentBreakPoint === 0) ? width * 0.95:width * 0.8
    const fivePercent = width * 0.05;
    const remainder = setWidth % (100 + fivePercent);
    setMainWidth(setWidth - remainder - fivePercent + 1);
  }, [width, currentBreakPoint]);

  return (
    <ScrollView
      style={{
        height: height * 5,
        width,
        backgroundColor: Colors.white,
        overflow: 'hidden',
      }}
    >
      {currentBreakPoint <= 0 ? (
        <BackButton to={'/settings'}/>
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
            fontSize: height * 0.09 - 20,
            height: height * 0.13,
            width: width * 0.8,
            textAlign: 'center',
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
            marginLeft: (width - mainWidth)/2
          }}
        >
          <Block href="/government/graph" width={100} height={100} text="Graph">
            <GraphAPILogo width={50} height={50} />
          </Block>
          <Block
            href="/government/commissions"
            width={100}
            height={100}
            text="Commissions"
          >
            <MedalIcon width={50} height={50} />
          </Block>
          <Block
            width={100}
            height={100}
            text="Sports"
            imageSource={require('assets/images/Football.png')}
            href="/government/sports"
          />
          <Block
            href="/government/homepage"
            width={100}
            height={100}
            text="Homepage"
          >
            <HomeIcon width={50} height={50} />
          </Block>
          <Block
            href="/government/calendar"
            width={100}
            height={100}
            text="Calendar"
          >
            <CalendarIcon width={50} height={50} />
          </Block>
          <Block
            href="/government/classes"
            width={100}
            height={100}
            text="Classes"
          >
            <GraduationHatIcon width={50} height={50} />
          </Block>
          <Block href="/government/admin" width={100} height={100} text="Admin">
            <GearIcon width={50} height={50} />
          </Block>
          <Block
            href="/government/resources"
            width={100}
            height={100}
            text="Resources"
          >
            <BookIcon width={50} height={50} />
          </Block>
          <Block
            href="/government/students"
            width={100}
            height={100}
            text="Students"
          >
            <StudentSearchIcon width={50} height={50} />
          </Block>
        </View>
      </View>
    </ScrollView>
  );
}
