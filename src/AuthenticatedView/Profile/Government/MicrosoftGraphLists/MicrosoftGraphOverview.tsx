import { View, Text, Button, Dimensions } from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import callMsGraph from '../../../../Functions/microsoftAssets'
import { accessTokenContent } from '../../../../../App';
import { Link } from 'react-router-native';
import NavBarComponent from '../../../../UI/NavComponent';

type ListType = {
  displayName: string
  listId: string
  name: string
}

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

export default function MicrosoftGraphOverview() {
  const [lists, setLists] = useState<ListType[]>([])
  const pageData = useContext(accessTokenContent);
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

  async function getLists(){
    const result = await callMsGraph(pageData.accessToken, "https://graph.microsoft.com/v1.0/sites/8td1tk.sharepoint.com,b2ef509e-4511-48c3-b607-a8c2cddc0e35,091feb8c-a978-4e3f-a60f-ecdc319b2304/lists")//sites/8td1tk.onmicrosoft.com/sites
    if (result.ok){
      const data = await result.json()
      console.log(data)
      var incomingLists: ListType[] = []
      for(let index = 0; index < data["value"].length; index++){
        incomingLists.push({
          displayName: data["value"][index]["displayName"],
          listId: data["value"][index]["id"],
          name: data["value"][index]["name"]
        })
      }
      console.log(incomingLists)
      setLists(incomingLists)
    } else {
      //TO DO handle error
    }
  }
  useEffect(() => {
    getLists()
  }, [])
  return (
    <View>
      <Link to="/profile/government">
        <Text>Back</Text>
      </Link>
      <Text>Microsoft Graph Overview</Text>
      <View>
        { lists.map((item: ListType) => (
          <Link key={item.listId + "Link"} to={"/profile/government/graph/edit/" + item.listId}>
            <View key={item.listId}>
              { //TO DO PRODuction fix these ids
                (item.listId !== "2b86ba89-0262-4906-9247-bfd1260fb68e" && item.listId != "1f4cd053-dd6b-4e40-bb9b-803cbc74e872") ? 
                <View style={{marginBottom: 5, borderColor: "black", borderWidth: 5}}>
                  <Text>{item.displayName}</Text>
                  <Text>{item.listId}</Text>
                </View>:null 
              }
            </View>
          </Link>
        ))}
      </View>
      <Link to={"/profile/government/graph/create"}>
          <Text>Create List</Text>
      </Link>
    </View>
  )
}