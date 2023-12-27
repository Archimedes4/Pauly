/*
  Pauly  
  Andrew Mainella
  23 November 2023
*/
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import createUUID, { getTextState } from '@utils/ultility/createUUID';
import callMsGraph from '@utils/ultility/microsoftAssets';
import { Colors, loadingStateEnum } from '@constants';
import SVGXml from '@components/SVGXml';
import { Link } from 'expo-router';
import SecondStyledButton from '@src/components/SecondStyledButton';

export default function GovernmentCreateNewSport() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);

  const [sportName, setSportName] = useState<string>('');
  const { siteId, sportsListId } = useSelector(
    (state: RootState) => state.paulyList,
  );
  const [svgData, setSvgData] = useState<string>('');
  const [createSportLoadingState, setCreateSportLoadingState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);

  async function createSport() {
    setCreateSportLoadingState(loadingStateEnum.loading);
    const newSportID: string = createUUID();
    const data = {
      fields: {
        Title: '',
        sportName,
        sportId: newSportID,
        sportSvg: svgData,
      },
    };
    const listData = {
      displayName: newSportID,
      columns: [
        {
          name: 'teamName',
          text: {},
          required: true,
        },
        {
          name: 'season',
          number: {},
          required: true,
        },
        {
          name: 'teamId',
          text: {},
          required: true,
          indexed: true,
          enforceUniqueValues: true,
        },
        {
          name: 'microsoftTeamId',
          text: {},
        },
      ],
      list: {
        template: ' genericList',
      },
    };
    const resultList = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists`,
      'POST',
      JSON.stringify(listData),
    );
    if (resultList.ok) {
      const result = await callMsGraph(
        `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${sportsListId}/items`,
        'POST',
        JSON.stringify(data),
      );
      if (result.ok) {
        setCreateSportLoadingState(loadingStateEnum.success);
      } else {
        setCreateSportLoadingState(loadingStateEnum.failed);
      }
    } else {
      setCreateSportLoadingState(loadingStateEnum.failed);
    }
  }
  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <Link href={'/government/sports'}>
        <Text>Back</Text>
      </Link>
      <Text style={{ marginLeft: 'auto', marginRight: 'auto', fontFamily: 'Comfortaa-Regular', marginBottom: 5, fontSize: 25 }}>Create New Sport</Text>
      <Text style={{marginLeft: 28, fontSize: 18, marginBottom: 2}}>Sport Name</Text>
      <TextInput value={sportName} onChangeText={setSportName} style={{borderWidth: 1, borderRadius: 30, borderColor: Colors.black, padding: 10, marginLeft: 15, marginRight: 15}}/>
      <TextInput
        value={svgData}
        onChangeText={e => {
          setSvgData(e);
        }}
        multiline
        numberOfLines={25}
        style={{marginLeft: 15, marginRight: 15, marginTop: 5}}
      />
      <View style={{marginLeft: 'auto', marginRight: 'auto', borderWidth: 1}}>
        <SVGXml xml={svgData} width={100} height={100} />
      </View>
      <SecondStyledButton 
        text={getTextState(createSportLoadingState, {
          notStarted: 'Create',
          success: 'Sport Created!',
        })}
        onPress={() => {
          if (sportName !== '' && svgData !== '') {
            createSport();
          }
        }}
        style={{marginBottom: 10, marginLeft: 15, marginRight: 15, marginTop: 10}}
      />
    </View>
  );
}
