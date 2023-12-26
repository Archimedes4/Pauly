import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import getCommissions from '@Functions/commissions/getCommissions';
import getSubmissions from '@Functions/commissions/getSubmissions';
import createUUID from '@src/Functions/ultility/createUUID';
import { RootState } from '@Redux/store';
import { Colors, loadingStateEnum, submissionTypeEnum } from '@src/types';
import ProgressView from '@components/ProgressView';
import { Link } from 'expo-router';

export default function GovernmentCommissions() {
  const { height, width } = useSelector((state: RootState) => state.dimentions);
  const [commissions, setCommissions] = useState<commissionType[]>([]);
  const [commissionsState, setCommissionsState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );

  async function loadData() {
    const result = await getCommissions();
    if (result.result === loadingStateEnum.success) {
      if (result.data !== undefined) {
        setCommissions(result.data);
      }
      // TO DO pagination
    }
    setCommissionsState(result.result);
  }

  useEffect(() => {
    loadData();
  }, []);
  return (
    <View style={{ height, width, backgroundColor: Colors.white }}>
      <View style={{ height: height * 0.1 }}>
        <Link href={'/profile/government'}>
          <Text>Back</Text>
        </Link>
        <View
          style={{
            width,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text>Commissions</Text>
        </View>
      </View>
      <View style={{ height: height * 0.85 }}>
        {commissionsState === loadingStateEnum.loading ? (
          <Text>Loading</Text>
        ) : (
          <>
            {commissionsState === loadingStateEnum.success ? (
              <ScrollView style={{ height: height * 0.85 }}>
                {commissions.map(commission => (
                  <CommissionBlock
                    key={`Commission_${
                      commission.commissionId
                    }_${createUUID()}`}
                    commission={commission}
                  />
                ))}
              </ScrollView>
            ) : (
              <Text>Failed</Text>
            )}
          </>
        )}
      </View>
      <View style={{ height: height * 0.05 }}>
        <Link href={'/profile/government/commissions/create'}>
          Create New Commission
        </Link>
      </View>
    </View>
  );
}

function CommissionBlock({ commission }: { commission: commissionType }) {
  const { width } = useSelector((state: RootState) => state.dimentions);
  const [unclaimedState, setUnclaimedState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [unclaimedCount, setUnclaimedCount] = useState<string>('0');

  async function loadData() {
    const result = await getSubmissions(
      commission.commissionId,
      submissionTypeEnum.unReviewed,
    );
    if (
      result.result === loadingStateEnum.success &&
      result.count !== undefined
    ) {
      if (result.count >= 50) {
        setUnclaimedCount(`${result.count.toString()}+`);
      } else {
        setUnclaimedCount(result.count.toString());
      }
    }
    setUnclaimedState(result.result);
  }

  useEffect(() => {
    loadData();
  }, []);
  return (
    <Link
      href={`/profile/government/commissions/${commission.commissionId}`}
      key={`Commission_${commission.commissionId}_${createUUID()}`}
      style={{
        margin: 10,
        borderRadius: 15,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
      }}
    >
      <View style={{ margin: 10 }}>
        <Text selectable={false}>{commission.title}</Text>
      </View>
      {unclaimedCount !== '0' ? (
        <View
          key={createUUID()}
          style={{
            width: 20,
            height: 20,
            borderRadius: 50,
            backgroundColor: 'red',
            position: 'absolute',
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            top: -2,
            left: width - 25,
          }}
        >
          <Text style={{ color: Colors.white }}>{unclaimedCount}</Text>
        </View>
      ) : null}
      {unclaimedState === loadingStateEnum.loading ? (
        <View
          key={createUUID()}
          style={{
            width: 20,
            height: 20,
            borderRadius: 50,
            backgroundColor: '#FF6700',
            position: 'absolute',
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            top: -2,
            left: width - 25,
          }}
        >
          <ProgressView width={10} height={10} />
        </View>
      ) : null}
      {unclaimedState === loadingStateEnum.failed ? (
        <View
          key={createUUID()}
          style={{
            width: 20,
            height: 20,
            borderRadius: 50,
            backgroundColor: 'red',
            position: 'absolute',
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            top: -2,
            left: width - 25,
          }}
        >
          <Text style={{ color: Colors.white }}>!</Text>
        </View>
      ) : null}
    </Link>
  );
}
