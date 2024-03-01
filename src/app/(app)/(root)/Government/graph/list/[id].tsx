import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { useSelector } from 'react-redux';
import callMsGraph from '@src/utils/ultility/microsoftAssests';
import { CopyIcon } from '@components/Icons';
import { RootState } from '@redux/store';
import { Colors } from '@constants';
import { Link, useLocalSearchParams } from 'expo-router';

export default function MicrosoftGraphEditList() {
  const { width, height } = useSelector((state: RootState) => state.dimensions);
  const { siteId } = useSelector((state: RootState) => state.paulyList);
  const [currentColumns, setCurrentColumns] = useState<listColumnType[]>([]);
  const { id } = useLocalSearchParams();
  const [isCoppiedToClipboard, setIsCoppiedToClipboard] =
    useState<boolean>(false);

  async function getListItems() {
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${id}/items?expand=fields`,
    );
    if (result.ok) {
      // const data = await result.json();
    } else {
    }
  }
  async function indexColumn(columnId: string) {
    const data = {
      indexed: 'true',
    };
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${id}/columns/${columnId}`,
      'PATCH',
      JSON.stringify(data),
    ); // TO DO fix ids
    if (result.ok) {
      const data = await result.json();
      const newColumnData: listColumnType[] = currentColumns;
      const index = newColumnData.findIndex(e => {
        e.id === columnId;
      });
      if (index !== -1) {
        newColumnData[index].indexed = true;
        setCurrentColumns(newColumnData);
      } else {
        // TO DO failed
      }
    }
  }
  async function getColumns() {
    const result = await callMsGraph(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${id}/columns`,
    );
    if (result.ok) {
      const data = await result.json();
      if (data.value.length !== undefined) {
        const newCurrentColumns: listColumnType[] = [];
        for (let index = 0; index < data.value.length; index += 1) {
          newCurrentColumns.push({
            columnGroup: data.value[index].columnGroup,
            description: data.value[index].description,
            displayName: data.value[index].displayName,
            enforceUniqueValues: data.value[index].enforceUniqueValues,
            hidden: data.value[index].hidden,
            id: data.value[index].id,
            indexed: data.value[index].indexed,
            name: data.value[index].name,
            readOnly: data.value[index].readOnly,
            required: data.value[index].required,
          });
        }
        setCurrentColumns(newCurrentColumns);
      }
    } else {
    }
  }
  useEffect(() => {
    getListItems();
    getColumns();
  }, []);
  return (
    <View
      style={{
        overflow: 'hidden',
        width,
        height,
        backgroundColor: Colors.white,
      }}
    >
      <Link href="/government/graph">Back</Link>
      <Text>Microsoft Graph Edit List</Text>
      <View style={{ flexDirection: 'row' }}>
        <Text>{id}</Text>
        {isCoppiedToClipboard ? (
          <Pressable
            onPress={async () => {
              if (typeof id === 'string') {
                await Clipboard.setStringAsync(id);
              }
            }}
          >
            <Text>Copied To Clipboard!</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={async () => {
              if (typeof id === 'string') {
                await Clipboard.setStringAsync(id);
                setIsCoppiedToClipboard(true);
              }
            }}
          >
            <CopyIcon width={14} height={14} />
          </Pressable>
        )}
      </View>
      <View
        style={{
          flexDirection: 'row',
          overflow: 'scroll',
          height: height * 0.4,
        }}
      >
        {currentColumns.map(item => (
          <View
            style={{
              width: width * 0.3,
              height: height * 0.4,
              borderColor: 'black',
              borderWidth: 2,
            }}
          >
            <Text>{item.displayName}</Text>
            {item.indexed === false ? (
              <Pressable
                onPress={() => {
                  indexColumn(item.id);
                }}
              >
                <Text>Index this Property</Text>
              </Pressable>
            ) : (
              <Text>Already Indexed</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
