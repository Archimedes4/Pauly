import React, { useState } from 'react';
import { Pressable, View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import getUsersLocation from '@utils/commissions/getLocation';
import {
  addImage,
  claimCommissionPost,
} from '@utils/commissions/claimCommissionsFunctions';
import {
  commissionTypeEnum,
  loadingStateEnum,
  locationStateEnum,
} from '@constants';
import ProgressView from '@components/ProgressView';
import { getTextState } from '@utils/ultility/createUUID';
import usePaulyApi from '@hooks/usePaulyApi';

export default function CommissionClaim({
  commission,
  imageData = undefined,
}: {
  commission: commissionType;
  imageData: string | undefined;
}) {
  const [claimCommissionState, setClaimCommissionState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);
  const { width } = useSelector((state: RootState) => state.dimensions);
  const accessToken = usePaulyApi()

  async function claimCommission() {
    setClaimCommissionState(loadingStateEnum.loading);

    let outImageUrl: string = '';
    if (
      (commission.value === commissionTypeEnum.Image ||
        commission.value === commissionTypeEnum.ImageLocation) &&
      imageData !== undefined
    ) {
      const outImage = await addImage(imageData);
      if (
        outImage.result === loadingStateEnum.success &&
        outImage.data !== undefined
      ) {
        outImageUrl = outImage.data;
      } else {
        setClaimCommissionState(loadingStateEnum.failed);
        return;
      }
    }
    if (
      commission.value === commissionTypeEnum.ImageLocation ||
      commission.value === commissionTypeEnum.Location
    ) {
      const locationResult = await getUsersLocation(commission);
      if (
        locationResult.result === locationStateEnum.success &&
        locationResult.data !== undefined
      ) {
        const result = await claimCommissionPost(
          accessToken,
          commission.commissionId,
          outImageUrl !== '' ? outImageUrl : undefined,
          locationResult.data,
        );
        setClaimCommissionState(result);
      } else {
        setClaimCommissionState(loadingStateEnum.failed);
      }
    } else {
      const result = await claimCommissionPost(
        accessToken,
        commission.commissionId,
        outImageUrl !== '' ? outImageUrl : undefined,
        undefined,
      );
      setClaimCommissionState(result);
    }
  }

  return (
    <Pressable
      onPress={() => {
        claimCommission();
      }}
      style={{
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: '#ededed',
        width: width * 0.7,
        borderRadius: 15,
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
      }}
    >
      {claimCommissionState === loadingStateEnum.loading ? (
        <View style={{ margin: 10 }}>
          <ProgressView width={24} height={24} />
        </View>
      ) : (
        <Text style={{ margin: 10, fontWeight: 'bold' }}>
          {getTextState(claimCommissionState, {
            notStarted: 'CLAIM COMMISSION',
            success: 'SUBMISSION SENT',
            failed: 'FAILED TO SEND SUBMISSION',
          })}
        </Text>
      )}
    </Pressable>
  );
}
