import { View, Text, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import callMsGraph from '../Functions/Ultility/microsoftAssets';
import { loadingStateEnum } from '../types';

export default function TeamAvatar({ teamId }: { teamId: string }) {
  const [teamAvatarDataUrl, setTeamAvatarDataUrl] = useState('');
  const [currentLoadingResult, setCurrentLoadingResult] =
    useState<loadingStateEnum>(loadingStateEnum.loading);

  async function getTeamsAvatar(usedTeamId: string) {
    try {
      const response = await callMsGraph(
        `https://graph.microsoft.com/v1.0/teams/${usedTeamId}/photo/$value`,
      );
      if (response.ok) {
        const dataBlob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(dataBlob);
        reader.onloadend = () => {
          const base64data = reader.result;
          if (base64data !== null) {
            setTeamAvatarDataUrl(base64data.toString());
            setCurrentLoadingResult(loadingStateEnum.success);
          } else {
            setCurrentLoadingResult(loadingStateEnum.failed);
          }
        };
      } else {
        setCurrentLoadingResult(loadingStateEnum.failed);
      }
    } catch {
      setCurrentLoadingResult(loadingStateEnum.failed);
    }
  }

  useEffect(() => {
    setCurrentLoadingResult(loadingStateEnum.loading);
    getTeamsAvatar(teamId);
  }, [teamId]);

  return (
    <View>
      {currentLoadingResult === loadingStateEnum.loading ? (
        <View>
          <Text>Loading</Text>
        </View>
      ) : (
        <View>
          {currentLoadingResult === loadingStateEnum.success ? (
            <View>
              {teamAvatarDataUrl !== '' && (
                <Image
                  width={100}
                  height={100}
                  style={{ width: 100, height: 100 }}
                  source={{ uri: teamAvatarDataUrl }}
                />
              )}
            </View>
          ) : (
            <View>
              <Text>Uh Oh something went wrong</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
