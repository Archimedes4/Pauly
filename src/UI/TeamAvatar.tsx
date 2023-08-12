import { View, Text, Image } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { accessTokenContent } from '../../App';

enum loadingResult {
    loading,
    success,
    failure,
    unauthenticated
}

export default function TeamAvatar({teamId}:{teamId: string}) {
    const microsoftAccessToken = useContext(accessTokenContent);
    const [teamAvatarDataUrl, setTeamAvatarDataUrl] = useState("")
    const [currentLoadingResult, setCurrentLoadingResult] = useState<loadingResult>(loadingResult.loading)

    async function getTeamsAvatar(teamId: string) {
        try{
            const response = await fetch("https://graph.microsoft.com/v1.0/teams/"+teamId+"/photo/$value", {method: "Get", headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + microsoftAccessToken
                },})
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

    useEffect(() => {
        console.log("This is avater", teamAvatarDataUrl)
    }, [teamAvatarDataUrl])
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
                        </View>:<View><Text>Uh Oh something went wrong</Text></View>
                    }
                </View>
            }
        </View>
    )
}