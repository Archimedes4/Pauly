import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-native';
import { RootState } from '../../../../../Redux/store';
import createUUID from '../../../../../Functions/ultility/createUUID';
import callMsGraph from '../../../../../Functions/ultility/microsoftAssets';
import { Colors, loadingStateEnum } from '../../../../../types';
import SVGXml from '../../../../../UI/SVGXml/SVGXml';

export default function GovernmentCreateNewSport() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);

  const [sportName, setSportName] = useState<string>('');
  const { siteId, sportsListId } = useSelector(
    (state: RootState) => state.paulyList,
  );
  const [svgData, setSvgData] = useState<string>('');
  const [createSportLoadingState, setCreateSportLoadingState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);
  const navigate = useNavigate();

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
      <Pressable
        onPress={() => {
          navigate('/profile/government/sports');
        }}
      >
        <Text>Back</Text>
      </Pressable>
      <Text>Create New Sport</Text>
      <Text>Sport Name</Text>
      <TextInput value={sportName} onChangeText={setSportName} />
      <TextInput
        value={svgData}
        onChangeText={e => {
          setSvgData(e);
        }}
        multiline
        numberOfLines={25}
      />
      <SVGXml xml={svgData} width={100} height={100} />
      <Pressable
        onPress={() => {
          if (sportName !== '' && svgData !== '') {
            createSport();
          }
        }}
      >
        <Text>
          {createSportLoadingState === loadingStateEnum.notStarted
            ? 'Create'
            : createSportLoadingState === loadingStateEnum.loading
            ? 'Loading'
            : createSportLoadingState === loadingStateEnum.success
            ? 'Created Sport!'
            : 'Failed to create sport.'}
        </Text>
      </Pressable>
    </View>
  );
}
