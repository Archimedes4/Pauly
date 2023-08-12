import { View, Text, Dimensions, Pressable } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import NavBarComponent from '../../../../UI/NavComponent';
import callMsGraph from '../../../../Functions/microsoftAssets';
import { accessTokenContent } from '../../../../../App';
import GovernmentHandleFileSubmissions from './GovernmentHandleFileSubmissions';
import { useMsal } from '@azure/msal-react';

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

type sportType = {
  name: string
  id: string
}

enum currentDataResult{
  loading,
  success,
  error
}

export default function GovernmentSports() {
  const microsoftAccessToken = useContext(accessTokenContent);
  const { instance, accounts } = useMsal();
  const [currentSports, setCurrentSports] = useState<sportType[]>([])
  const [dimensions, setDimensions] = useState({
    window: windowDimensions,
    screen: screenDimensions,
  });
  const [dataResult, setDataResult] = useState<currentDataResult>(currentDataResult.loading)

  useEffect(() => {
      const subscription = Dimensions.addEventListener(
        'change',
        ({window, screen}) => {
          setDimensions({window, screen});
        },
      );
      return () => subscription?.remove();
  });

  async function getSports(){
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/8td1tk.sharepoint.com,b2ef509e-4511-48c3-b607-a8c2cddc0e35,091feb8c-a978-4e3f-a60f-ecdc319b2304/lists/af29f01a-df11-4e9d-85c8-7461ca4dc6e9/items?expand=fields", instance, accounts)//TO DO list id
    if (result.ok) {
      const data = await result.json()
      console.log(data)
      console.log(data)
      if (data["value"] !== null && data["value"] !== undefined){
        var resultData: sportType[] = []
        for (let index = 0; index < data["value"].length; index++) {
          resultData.push({
            name: data["value"][index]["fields"]["SportName"],
            id: data["value"][index]["fields"]["SportID"]
          })
        }
        setCurrentSports(resultData)
        console.log(resultData)
        setDataResult(currentDataResult.success)
      } else {
        setDataResult(currentDataResult.error)
      }
    } else {
      setDataResult(currentDataResult.error)
    }
  }

  useEffect(() => {
    getSports()
  }, [])

  return (
    <View>
      <Link to="/profile/government/">
        <Text>Back</Text>
      </Link>
      <Text>Government Sports</Text>
      <View>
        { (dataResult === currentDataResult.loading) ?
          <View><Text>Loading</Text></View>:
          <View>
            {(dataResult === currentDataResult.success) ?
              <View>
                {currentSports.map((item, id) => (
                  <Link to={"/profile/government/sports/team/" + item.name + "/" + item.id}>
                    <View key={id}>
                      <Text>{item.name}</Text>
                    </View>
                  </Link>
                ))}
              </View>:<View><Text>Error</Text></View>
            }
          </View>
        }
      </View>
      <Link to="/profile/government/sports/create">
        <Text>Create Sport</Text>
      </Link>
      <Link to="/profile/government/sports/post/0/0/0/0/0">
        <Text>Create Post</Text>
      </Link>
      <GovernmentHandleFileSubmissions/>
    </View>
  )
}