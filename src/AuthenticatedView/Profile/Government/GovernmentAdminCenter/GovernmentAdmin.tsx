import { View, Text, Button } from 'react-native'
import React, { useContext, useState } from 'react'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { useMsal } from '@azure/msal-react';
import { accessTokenContent } from '../../../../../App';
import { siteID } from '../../../../PaulyConfig';
import { loadingStateEnum } from '../../../../types';
import { Link } from 'react-router-native';
import initilizePauly from '../../../../Functions/initilizePauly';

export default function GovernmentAdmin() {
  const pageData = useContext(accessTokenContent);
  const [initilizePaulyLoadingResult, setInitilizePaulyLoadingResult] = useState<loadingStateEnum>(loadingStateEnum.notStarted)
  async function InitilizePauly() {
    setInitilizePaulyLoadingResult(loadingStateEnum.loading)
    const result = await initilizePauly()
    setInitilizePaulyLoadingResult(result)
  }
  return (
    <View>
      <Link to="/profile/government">
        <Text>Back</Text>
      </Link>
      <Button title={(initilizePaulyLoadingResult === loadingStateEnum.notStarted) ? "Initilize Pauly on New Tenant":(initilizePaulyLoadingResult ===  loadingStateEnum.loading) ? "Loading":(initilizePaulyLoadingResult === loadingStateEnum.success) ? "Success":"Failed"} onPress={() => {if (initilizePaulyLoadingResult === loadingStateEnum.notStarted) {InitilizePauly()}}}/>
    </View>
  )
}