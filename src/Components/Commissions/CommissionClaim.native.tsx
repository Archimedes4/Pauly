/*
  Pauly
  Andrew Mainella
  November 10 2023
  CommissionClaim.native.tsx
*/
import { refreshAsync, useAutoDiscovery } from 'expo-auth-session';
import React, { useState } from 'react';
import { Pressable, View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import store, { RootState } from '@redux/store';
import {
  commissionTypeEnum,
  loadingStateEnum,
  locationStateEnum,
} from '@constants';
import getUsersLocation from '@utils/commissions/getLocation';
import {
  addImage,
  claimCommissionPost,
} from '@utils/commissions/claimCommissionsFunctions';
import ProgressView from '@components/ProgressView';
import { getTextState } from '@utils/ultility/createUUID';

/**
 *
 * @param param0
 * @returns
 */
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

  const discovery = useAutoDiscovery(
    `https://login.microsoftonline.com/${process.env.EXPO_PUBLIC_TENANTID}/v2.0`,
  );

  async function claimCommission() {
    if (discovery !== null) {
      setClaimCommissionState(loadingStateEnum.loading);
      try {
        const apiResult = await refreshAsync(
          {
            refreshToken: store.getState().authenticationRefreshToken,
            clientId: (process.env.EXPO_PUBLIC_CLIENTID) ? process.env.EXPO_PUBLIC_CLIENTID:"",
            scopes: [`api://${process.env.EXPO_PUBLIC_CLIENTID}/api/commissions`],
          },
          discovery,
        );
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
      } catch {
        setClaimCommissionState(loadingStateEnum.failed);
      }
    } else {
      setClaimCommissionState(loadingStateEnum.failed);
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
