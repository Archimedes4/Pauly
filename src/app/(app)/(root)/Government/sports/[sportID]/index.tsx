import { View, Text, Pressable, Modal, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FlatList } from 'react-native-gesture-handler';
import callMsGraph from '@utils/ultility/microsoftAssets';
import store, { RootState } from '@redux/store';
import { Colors, loadingStateEnum } from '@constants';
import { getSport, getSportsTeams } from '@utils/sports/sportsFunctions';
import { WarningIcon } from '@src/components/Icons';
import SVGXml from '@components/SVGXml';
import { getTextState } from '@utils/ultility/createUUID';
import { Link, useGlobalSearchParams } from 'expo-router';
import SecondStyledButton from '@src/components/SecondStyledButton';
import ProgressView from '@src/components/ProgressView';

function SportsUpdateModel({
  isPickingSvg,
  setIsPickingSvg,
  id,
}: {
  isPickingSvg: boolean;
  setIsPickingSvg: (item: boolean) => void;
  id: string;
}) {
  const [svgData, setSvgData] = useState<string>('');
  const [listId, setListId] = useState<string>('');
  const [getSportState, setGetSportState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [updateSportState, setUpdateSportState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  async function updateSport() {
    setUpdateSportState(loadingStateEnum.loading);
    const updateData = {
      fields: {
        sportSvg: svgData,
      },
    };
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${
        store.getState().paulyList.siteId
      }/lists/${store.getState().paulyList.sportsListId}/items/${listId}`,
      'PATCH',
      JSON.stringify(updateData),
    );
    if (result.ok) {
      setUpdateSportState(loadingStateEnum.success);
    } else {
      const data = await result.json();
      setUpdateSportState(loadingStateEnum.failed);
    }
  }

  async function loadSport() {
    const result = await getSport(id);
    if (
      result.result === loadingStateEnum.success
    ) {
      setListId(result.listId);
      setSvgData(result.data.svgData);
      setGetSportState(loadingStateEnum.success);
    } else {
      setGetSportState(loadingStateEnum.failed);
    }
  }

  useEffect(() => {
    loadSport();
  }, []);

  return (
    <Modal
      visible={isPickingSvg}
      animationType="slide"
      style={{ backgroundColor: Colors.white }}
    >
      {getSportState === loadingStateEnum.loading ? (
        <View>
          <Text>Loading</Text>
          <Pressable onPress={() => setIsPickingSvg(false)}>
            <Text>Dismiss</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {getSportState === loadingStateEnum.success ? (
            <View>
              <Text>Svg</Text>
              <View style={{ width: 100, height: 100, overflow: 'hidden' }}>
                <SVGXml xml={svgData} width={100} height={100} />
              </View>
              <TextInput
                value={svgData}
                onChangeText={e => {
                  setSvgData(e);
                }}
                multiline
                numberOfLines={25}
              />
              <Pressable onPress={() => updateSport()}>
                <Text>
                  {getTextState(updateSportState, { notStarted: 'Confirm' })}
                </Text>
              </Pressable>
              <Pressable onPress={() => setIsPickingSvg(false)}>
                <Text>Dismiss</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <Text>Failed</Text>
              <Pressable onPress={() => setIsPickingSvg(false)}>
                <Text>Dismiss</Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </Modal>
  );
}

function GovernmentSportTeams({sportID}:{sportID: string}) {
  const [teamState, setTeamState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [currentTeams, setCurrentTeams] = useState<sportTeamType[]>([]);

  async function loadData() {
    const result = await getSportsTeams(sportID);
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setCurrentTeams(result.data);
    }
    setTeamState(result.result);
  }

  useEffect(() => {
    loadData();
  }, [])

  if (teamState === loadingStateEnum.loading) {
    return (
      <View style={{flex:1, alignItems:'center', justifyContent:'center', alignContent: 'center'}}>
        <ProgressView width={14} height={14}/>
        <Text>Loading</Text>
      </View>
    )
  }

  if (teamState === loadingStateEnum.success) {
    return (
      <FlatList
        data={currentTeams}
        renderItem={item => (
          <Link href={`/government/sports/${sportID}/team/${item.item.teamId}`} key={`TeamBlock_${item.item.teamId}`} style={{padding: 10}}>
            {item.item.teamName}
          </Link>
        )}
      />
    )
  }

  return (
    <View>
      <Text>Error</Text>
    </View>  
  )
}

export default function GovernmentSport() {
  const { sportID } = useGlobalSearchParams();
  const { width, height } = useSelector((state: RootState) => state.dimentions);

  const [sportName, setSportName] = useState<string | undefined>(undefined);
  const [sportState, setSportState] = useState(loadingStateEnum.notStarted);

  const [deleteSportState, setDeleteSportState] = useState<loadingStateEnum>(
    loadingStateEnum.notStarted,
  );
  const [isPickingSvg, setIsPickingSvg] = useState<boolean>(false);

  async function deleteSport() {
    setDeleteSportState(loadingStateEnum.loading);
    const listResult = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${
        store.getState().paulyList.siteId
      }/lists/${sportID}`,
      'DELETE',
    );
    if (listResult.ok) {
      const getSportResult = await callMsGraph(
        `https://graph.microsoft.com/v1.0/sites/${
          store.getState().paulyList.siteId
        }/lists/${
          store.getState().paulyList.sportsListId
        }/items?$expand=fields&$filter=fields/sportId%20eq%20'${sportID}'&$select=id`,
      );
      if (getSportResult.ok) {
        const getSportData = await getSportResult.json();
        if (getSportData.value.length === 1) {
          const itemDeleteResult = await callMsGraph(
            `https://graph.microsoft.com/v1.0/sites/${
              store.getState().paulyList.siteId
            }/lists/${store.getState().paulyList.sportsListId}/items/${
              getSportData.value[0].id
            }`,
            'DELETE',
          );
          if (itemDeleteResult.ok) {
            setDeleteSportState(loadingStateEnum.success);
          } else {
            setDeleteSportState(loadingStateEnum.failed);
          }
        } else {
          setDeleteSportState(loadingStateEnum.failed);
        }
      } else {
        setDeleteSportState(loadingStateEnum.failed);
      }
    } else {
      setDeleteSportState(loadingStateEnum.failed);
    }
  }


  async function loadSport() {
    setSportState(loadingStateEnum.loading)
    if (typeof sportID === 'string') {
      const result = await getSport(sportID);
      if (
        result.result === loadingStateEnum.success
      ) {
        setSportName(result.data.name)
        setSportState(loadingStateEnum.success);
      } else {
        setSportState(loadingStateEnum.failed);
      }
    }
  }

  useEffect(() => {
    loadSport();
  }, []);

  if (sportState === loadingStateEnum.loading) {
    return (
      <View style={{ width, height, backgroundColor: Colors.white, alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
        <Link href={'/government/sports'} style={{position: 'absolute', top: 0, left: 0}}>
          Back
        </Link>
        <ProgressView width={14} height={14}/>
        <Text>Loading</Text>
      </View>
    )
  }

  if (typeof sportName !== "string" || sportState !== loadingStateEnum.success || typeof sportID !== 'string') {
    return (
      <View style={{ width, height, backgroundColor: Colors.white }}>
        <Link href={'/government/sports'}>
          Back
        </Link>
        <Text>Failed</Text>
      </View>
    )
  }

  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <Link href={'/government/sports'}>
        Back
      </Link>
      <Text style={{marginLeft: 'auto', marginRight: 'auto', fontSize: 25}}>{sportName} Teams</Text>
      <GovernmentSportTeams sportID={sportID} />
      <SecondStyledButton style={{marginLeft: 15, marginRight: 15, marginBottom: 10}} text='Pick SVG' onPress={() => setIsPickingSvg(true)}/>
      <SecondStyledButton style={{marginLeft: 15, marginRight: 15, marginBottom: 10}} text='Create New Team' to={`/government/sports/${sportID}/team/create`}/>
      <Pressable
        style={{ borderRadius: 15, backgroundColor: 'red', marginLeft: 15, marginRight: 15, marginBottom: 10 }}
        onPress={() => {
          if (
            deleteSportState === loadingStateEnum.notStarted ||
            deleteSportState === loadingStateEnum.failed
          ) {
            deleteSport();
          }
        }}
      >
        <View style={{ flexDirection: 'row', margin: 10 }}>
          <WarningIcon width={14} height={14} style={{marginTop: 'auto', marginBottom: 'auto'}}/>
          <Text style={{fontFamily: 'Roboto', fontSize: 16, marginLeft: 2}}>
            {getTextState(deleteSportState, {
              notStarted: 'Delete Sport',
              success: "Sport Deleted",
              failed: "Failed To Delete Sport"
            })}
          </Text>
        </View>
      </Pressable>
      <SportsUpdateModel
        isPickingSvg={isPickingSvg}
        setIsPickingSvg={setIsPickingSvg}
        id={sportID}
      />
    </View>
  );
}
