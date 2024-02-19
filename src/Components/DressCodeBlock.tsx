/*
  Pauly
  Andrew Mainella
  23 January 2024
  DressCodeBlock.tsx
  A component used in government dress code edit/create. This allows the user to enter the name and description of the dress code. Used in a flat list.
*/
import { useSelector } from 'react-redux';
import { Pressable, View, Text, TextInput } from 'react-native';
import React from 'react';
import { RootState } from '@redux/store';
import { CloseIcon, DownIcon, UpIcon, WarningIcon } from '@components/Icons';

export default function DressCodeBlock({
  dressCode,
  index,
  dressCodeData,
  setDressCodeData,
}: {
  dressCode: dressCodeDataType;
  index: number;
  dressCodeData: dressCodeDataType[];
  setDressCodeData: (item: dressCodeDataType[]) => void;
}) {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  return (
    <Pressable
      style={{
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        borderRadius: 15,
        marginLeft: width * 0.03,
        marginRight: width * 0.03,
        marginTop: height * 0.02,
        marginBottom: height * 0.02,
      }}
    >
      <View style={{ margin: 10, flexDirection: 'row' }}>
        <View>
          <View style={{ flexDirection: 'row' }}>
            {dressCode.name === '' ? (
              <WarningIcon width={14} height={14} outlineColor="red" style={{marginTop: 'auto', marginBottom: 'auto'}}/>
            ) : null}
            <Text>
              Name: 
            </Text>
            <TextInput
              placeholder="Dress Code Name"
              value={dressCode.name}
              onChangeText={e => {
                const newDressCodeData = dressCodeData;
                newDressCodeData[index].name = e;
                setDressCodeData([...newDressCodeData]);
              }}
            />

          </View>
          <View style={{ flexDirection: 'row', width: width - width * 0.06 - 80 }}>
            {dressCode.description === '' ? (
              <WarningIcon width={14} height={14} outlineColor="red" style={{marginTop: 'auto', marginBottom: 'auto'}}/>
            ) : null}
            <Text>
              Description: 
            </Text>
            <TextInput
              placeholder="Dress Code Description"
              value={dressCode.description}
              onChangeText={e => {
                const newDressCodeData = dressCodeData;
                newDressCodeData[index].description = e;
                setDressCodeData([...newDressCodeData]);
              }}
              multiline
              numberOfLines={4}
              style={{ width: '100%' }}
            />
          </View>
        </View>
        <View>
          <UpIcon width={14} height={14} />
          <DownIcon width={14} height={14} />
          <Pressable>
            <CloseIcon width={14} height={14} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
