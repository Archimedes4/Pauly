import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../Redux/store';
import { Colors, loadingStateEnum } from '../../../../../types';
import ListItem from '../../../../../UI/ListItem';
import getDressCodeData from '../../../../../Functions/homepage/getDressCodeData';

export default function GovernmentDressCode() {
  const { width, height } = useSelector((state: RootState) => state.dimentions);
  const [getDressCodeState, setGetDressCodeState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [dressCodes, setDressCodes] = useState<dressCodeType[]>([]);
  const navigate = useNavigate();

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
      <Pressable onPress={() => navigate('/profile/government/calendar')}>
        <Text>Back</Text>
      </Pressable>
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
                    width={width}
                  />
                ))}
              </View>
            ) : (
              <Text>Failed</Text>
            )}
          </View>
        )}
      </View>
      <Pressable
        onPress={() =>
          navigate('/profile/government/calendar/dresscode/create')
        }
      >
        <Text>Create Dress Code</Text>
      </Pressable>
    </View>
  );
}
