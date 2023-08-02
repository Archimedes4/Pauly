import { View, Text, Dimensions } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import NavBarComponent from '../../UI/NavComponent'
import callMsGraph from '../../Functions/microsoftAssets';
import { accessTokenContent } from '../../../App';
import TeamAvatar from '../../UI/TeamAvatar';

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

type teamType = {
  teamName: string
  teamID: string
}

enum loadingResult {
  loading,
  success,
  failure,
  unauthorized,
}

export default function Quiz() {
  const microsoftAccessToken = useContext(accessTokenContent);
  const [teams, setTeams] = useState<teamType[]>([])
  const [currentLoadingResult, setCurrentLoadingResult] = useState<loadingResult>(loadingResult.loading)
  const [dimensions, setDimensions] = useState({
    window: windowDimensions,
    screen: screenDimensions,
  });

  useEffect(() => {
      const subscription = Dimensions.addEventListener(
        'change',
        ({window, screen}) => {
          setDimensions({window, screen});
        },
      );
      return () => subscription?.remove();
  });

  async function getTeams(){
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/me/joinedTeams")
    if (result.ok){
      const data = await result.json()
      console.log(result, data)
      var resultTeams: teamType[] = []
      //TO DO fix something going wrong here
      for(let index = 0; index < data["value"].length; index++){
        resultTeams.push({
          teamName: data["value"][index]["displayName"],
          teamID: data["value"][index]["id"]
        })
      }
      setTeams(resultTeams)
      setCurrentLoadingResult(loadingResult.success)
    } else {
      setCurrentLoadingResult(loadingResult.failure)
    }
  }

  useEffect(() => {
    getTeams()
  }, [])

  return (
    <View style={{flexDirection: "row"}}>
      <View>
        <Link to="/">
          <Text>Back</Text>
        </Link>
        <View style={{width: dimensions.window.width * 0.2, height: dimensions.window.height, backgroundColor: "#e9e9e9"}}>
          {teams.map((item, id) => (
            <View key={id}>
              <TeamAvatar teamId={item.teamID} />
              <Text>{item.teamName}</Text>
            </View>
            ))
          }
        </View>
      </View>
      <View style={{width: dimensions.window.width * 0.7, height: dimensions.window.height, backgroundColor: "white"}}>

      </View>
    </View>
  )
}