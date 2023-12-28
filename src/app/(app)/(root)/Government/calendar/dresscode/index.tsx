import { View, Text, Pressable, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { Colors, loadingStateEnum } from '@constants';
import ListItem from '@src/components/StyledButton';
import getDressCodeData from '@utils/notifications/getDressCodeData';
import { Link } from 'expo-router';
import SecondStyledButton from '@src/components/SecondStyledButton';

function GovernmentDressCodeBody() {
  const { width } = useSelector((state: RootState) => state.dimentions);
  const [getDressCodeState, setGetDressCodeState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [dressCodes, setDressCodes] = useState<dressCodeType[]>([]);

  async function loadData() {
    const result = await getDressCodeData();
    setGetDressCodeState(result.result);
    if (
      result.result === loadingStateEnum.success &&
      result.data !== undefined
    ) {
      setDressCodes(result.data);
    }
  }

  useEffect(() => {
    loadData();
  }, []);
  if (getDressCodeState === loadingStateEnum.loading) {
    return (
      <Text>Loading</Text>
    )
  }
  
  if (getDressCodeState === loadingStateEnum.success) {
    return (
      <FlatList 
        data={dressCodes}
        renderItem={dressCode => (
          <ListItem
            key={dressCode.item.id}
            to={`/government/calendar/dresscode/${dressCode.item.id}`}
            text={dressCode.item.name}
          />
        )}
      />
    )
  }
  return (
    <Text>Failed</Text>
  )
}

export default function GovernmentDressCode() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);

  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <Link href="/government/calendar">
        <Text>Back</Text>
      </Link>
      <Text style={{ marginLeft: 'auto', marginRight: 'auto', fontFamily: 'Comfortaa-Regular', marginBottom: 5, fontSize: 25 }}>
        Dress Codes
      </Text>
      <GovernmentDressCodeBody />
      <SecondStyledButton style={{marginBottom: 15, marginLeft: 15, marginRight: 15, marginTop: 5}} text='Create Dress Code' to='/government/calendar/dresscode/create'/>
    </View>
  );
}
