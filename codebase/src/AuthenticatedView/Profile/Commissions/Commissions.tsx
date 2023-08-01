import React, { useContext, useEffect, useState } from 'react'
import { Button, Dimensions, Platform, Text, View } from 'react-native'
import Geolocation from '@react-native-community/geolocation';
import { Link } from 'react-router-native';
import callMsGraph from '../../../Functions/microsoftAssets';
import { accessTokenContent } from '../../../App';
import NavBarComponent from '../../../UI/NavComponent';
import { siteID } from '../../../PaulyConfig';

enum CommissionMode{
  Before,
  Current,
  Upcoming
}


const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

export default function Commissions() {
  const microsoftAccessToken = useContext(accessTokenContent);
  const [currentCommissions, setCurrentCommissions] = useState<commissionType[]>([])
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
  
  useEffect(() => {
    setDimensions({
        window: Dimensions.get('window'),
        screen: Dimensions.get('screen')
    })
  }, [])

  async function getUsersLocation(){
    Geolocation.getCurrentPosition(info => console.log(info))
  }
  async function getCommissions(){
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/sites/" + siteID + "/lists/15357035-e94e-4664-b6a4-26e641f0f509/items?expand=fields")//TO DO list id
    if (result.ok) {
      const data = await result.json()
      console.log(data)
      if (data["value"] !== null && data["value"] !== undefined){
        var resultCommissions: commissionType[] = []
        for (let index = 0; index < data["value"].length; index++) {
          resultCommissions.push({
            title: data["value"][index]["fields"]["Title"],
            startDate: new Date(data["value"][index]["fields"]["StartDate"]),
            endDate:  new Date(data["value"][index]["fields"]["EndDate"]),
            points:  data["value"][index]["fields"]["Points"] as number,
            proximity: data["value"][index]["fields"]["Proximity"] as number,
            commissionId: data["value"][index]["fields"]["CommissionID"] as string,
            hidden: data["value"][index]["fields"]["Hidden"]
          })
        }
        setCurrentCommissions(resultCommissions)
      }
    }
  }
  useEffect(() => {
    getCommissions()
  }, [])
  return (
    <View>
      { (dimensions.window.width > 576) ?
        null:<Link to="/profile/">
          <Text>Back</Text>
        </Link>
      }
      <Text>Commissions</Text>
      { currentCommissions.map((item: commissionType) => (
        <Link to={"/profile/commissions/" + item.commissionId}>
          <View key={item.commissionId}>
            <Text>{item.title}</Text>
          </View>
        </Link>
      ))}
      <Button title="Show me my current location" onPress={() => {getUsersLocation()}}/>
    </View>
  )
}
