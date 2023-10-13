import { View, Text, Image } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import store from '../Redux/store'
import callMsGraph from '../Functions/Ultility/microsoftAssets'

enum loadingResult {
    loading,
    success,
    failure,
    unauthenticated
}

export default function TeamAvatar({teamId}:{teamId: string}) {
  const [teamAvatarDataUrl, setTeamAvatarDataUrl] = useState("")
  const [currentLoadingResult, setCurrentLoadingResult] = useState<loadingResult>(loadingResult.loading)

  async function getTeamsAvatar(teamId: string) {
    try{
      const response = await callMsGraph(`https://graph.microsoft.com/v1.0/teams/${teamId}/photo/$value`)
      if (response.ok){
        const dataBlob = await response.blob()
        var reader = new FileReader();
        reader.readAsDataURL(dataBlob); 
        reader.onloadend = function() {
        var base64data = reader.result;                
          if (base64data !== null){
            setTeamAvatarDataUrl(base64data.toString())
            setCurrentLoadingResult(loadingResult.success)
          } else {
            setCurrentLoadingResult(loadingResult.failure)
          }
        }
      } else {
        if (response.status === 401){
          setCurrentLoadingResult(loadingResult.unauthenticated)
        } else {
          setCurrentLoadingResult(loadingResult.failure)
        }
      }
    } catch {
      setCurrentLoadingResult(loadingResult.failure)
    }
  }
  useEffect(() => {
    setCurrentLoadingResult(loadingResult.loading)
    getTeamsAvatar(teamId)
  }, [teamId])

  return (
    <View>
      {(currentLoadingResult === loadingResult.loading) ?
        <View>
          <Text>Loading</Text>
        </View>:<View>
          {(currentLoadingResult === loadingResult.success) ?
            <View>
              { (teamAvatarDataUrl !== "") &&
                <Image width={100} height={100} style={{width: 100, height: 100}} source={{uri: teamAvatarDataUrl}}/>
              }
            </View>:
            <View>
              <Text>Uh Oh something went wrong</Text>
            </View>
          }
        </View>
      }
    </View>
  )
}