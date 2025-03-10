import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import getCommissions from '@utils/commissions/getCommissionsApi';
import getSubmissions from '@utils/commissions/getSubmissions';
import createUUID from '@utils/ultility/createUUID';
import store, { RootState } from '@redux/store';
import {
  Colors,
  loadingStateEnum,
  styles,
  submissionTypeEnum,
} from '@constants';
import ProgressView from '@components/ProgressView';
import { Link } from 'expo-router';
import StyledButton from '@components/StyledButton';
import BackButton from '@components/BackButton';
import { safeAreaColorsSlice } from '@redux/reducers/safeAreaColorsReducer';

function GovernmentCommissionsBody() {
  const [commissions, setCommissions] = useState<commissionType[]>([]);
  const [commissionsState, setCommissionsState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );

  async function loadData() {
    const result = await getCommissions({ store });
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
        style={{backgroundColor: Colors.lightGray, paddingTop: 10}}
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
  const { height, width } = useSelector((state: RootState) => state.dimensions);

  useEffect(() => {
    store.dispatch(safeAreaColorsSlice.actions.setSafeArea({
      top: Colors.lightGray,
      bottom: Colors.lightGray,
      isTopTransparent: false,
      isBottomTransparent: false,
      overflowHidden: false
    }))
  }, [])

  return (
    <View style={{ height, width, backgroundColor: Colors.lightGray }}>
      <BackButton to="/government" />
      <Text style={[styles.headerText, { paddingTop: 10 }]}>Commissions</Text>
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
  const { width } = useSelector((state: RootState) => state.dimensions);
  const [unclaimedState, setUnclaimedState] = useState<loadingStateEnum>(
    loadingStateEnum.loading,
  );
  const [unclaimedCount, setUnclaimedCount] = useState<string>('0');

  async function loadData() {
    const result = await getSubmissions({
      commissionId: commission.commissionId,
      submissionType: submissionTypeEnum.unReviewed,
    });
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
        margin: 15,
        marginBottom: 5,
        borderRadius: 12,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
      }}
    >
      <View
        style={{
          borderRadius: 12,
          backgroundColor: Colors.white,
          overflow: 'hidden',
          width: width - 30,
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
      </View>
    </Link>
  );
}
