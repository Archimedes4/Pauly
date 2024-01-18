import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import getCommissions from '@utils/commissions/getCommissions';
import getSubmissions from '@utils/commissions/getSubmissions';
import createUUID from '@utils/ultility/createUUID';
import { RootState } from '@redux/store';
import { Colors, loadingStateEnum, submissionTypeEnum } from '@constants';
import ProgressView from '@components/ProgressView';
import { Link } from 'expo-router';
import StyledButton from '@components/StyledButton';

function GovernmentCommissionsBody() {
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

  if (commissionsState === loadingStateEnum.loading) {
    return (
      <View
        style={{
          flex: 1,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProgressView width={14} height={14} />
        <Text>Loading</Text>
      </View>
    );
  }

  if (commissionsState === loadingStateEnum.success) {
    return (
      <FlatList
        data={commissions}
        renderItem={commission => (
          <CommissionBlock
            key={`Commission_${commission.item.commissionId}_${createUUID()}`}
            commission={commission.item}
          />
        )}
      />
    );
  }

  return (
    <View
      style={{
        flex: 1,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text>Failed</Text>
    </View>
  );
}

export default function GovernmentCommissions() {
  const { height, width } = useSelector((state: RootState) => state.dimentions);

  return (
    <View style={{ height, width, backgroundColor: Colors.white }}>
      <Link href="/government">
        <Text>Back</Text>
      </Link>
      <Text
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          fontFamily: 'Comfortaa-Regular',
          marginBottom: 5,
          fontSize: 25,
        }}
      >
        Commissions
      </Text>
      <GovernmentCommissionsBody />
      <StyledButton
        style={{
          marginLeft: 15,
          marginRight: 15,
          marginBottom: 15,
          marginTop: 5,
        }}
        to="/government/commissions/create"
        second
        text="Create New Commission"
      />
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
      href={`/government/commissions/${commission.commissionId}`}
      key={`Commission_${commission.commissionId}_${createUUID()}`}
      style={{
        margin: 10,
        borderRadius: 15,
        shadowColor: Colors.black,
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
