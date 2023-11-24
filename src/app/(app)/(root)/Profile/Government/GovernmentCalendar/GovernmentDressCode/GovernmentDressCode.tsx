import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/store';
import { Colors, loadingStateEnum } from '@/types';
import ListItem from '@/components/ListItem';
import getDressCodeData from '@/Functions/notifications/getDressCodeData';
import { Link } from 'expo-router';

export default function GovernmentDressCode() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
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

  return (
    <View style={{ width, height, backgroundColor: Colors.white }}>
      <Link href={'/profile/government/calendar'}>
        <Text>Back</Text>
      </Link>
      <Text style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        Dress Codes
      </Text>
      <View>
        {getDressCodeState === loadingStateEnum.loading ? (
          <Text>Loading</Text>
        ) : (
          <View>
            {getDressCodeState === loadingStateEnum.success ? (
              <View>
                {dressCodes.map(dressCode => (
                  <ListItem
                    key={dressCode.id}
                    to={`/profile/government/calendar/dresscode/${dressCode.id}`}
                    title={dressCode.name}
                    width={width}caption={undefined} onPress={undefined} style={undefined}                  />
                ))}
              </View>
            ) : (
              <Text>Failed</Text>
            )}
          </View>
        )}
      </View>
      <Link href={'/profile/government/calendar/dresscode/create'}>
        Create Dress Code
      </Link>
    </View>
  );
}
