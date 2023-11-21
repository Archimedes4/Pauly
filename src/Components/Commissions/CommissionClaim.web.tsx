import { useMsal } from '@azure/msal-react';
import React, { useState } from 'react';
import { Pressable, View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';
import { clientId } from '../../PaulyConfig';
import getUsersLocation from '../../Functions/commissions/getLocation';
import {
  addImage,
  claimCommissionPost,
} from '../../Functions/commissions/claimCommissionsFunctions';
import {
  commissionTypeEnum,
  loadingStateEnum,
  locationStateEnum,
} from '../../types';
import ProgressView from '../../components/ProgressView';
import { getTextState } from '../../Functions/ultility/createUUID';

export default function CommissionClaim({
  commission,
  imageData = undefined,
}: {
  commission: commissionType;
  imageData: string | undefined;
}) {
  const [claimCommissionState, setClaimCommissionState] =
    useState<loadingStateEnum>(loadingStateEnum.notStarted);
  const { width } = useSelector((state: RootState) => state.dimentions);
  const { instance } = useMsal();

  async function claimCommission() {
    setClaimCommissionState(loadingStateEnum.loading);
    const apiResult = await instance.acquireTokenSilent({
      scopes: [`api://${clientId}/api/commissions`],
    });
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
          apiResult.accessToken,
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
        apiResult.accessToken,
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
