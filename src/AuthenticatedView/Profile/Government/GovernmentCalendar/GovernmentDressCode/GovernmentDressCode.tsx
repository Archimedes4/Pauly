import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../Redux/store'
import { loadingStateEnum } from '../../../../../types'
import callMsGraph from '../../../../../Functions/microsoftAssets'
import ListItem from '../../../../../UI/ListItem'
import getDressCodeData from '../../../../../Functions/getDressCodeData'

declare global{
  type dressCodeIncentiveType = {
    name: string,
    description: string,
    requirementsDescription: string,
    id: string
  }
  type dressCodeDataType = {
    name: string,
    description: string,
    id: string
  }
  type dressCodeType = {
    name: string,
    id: string,
    dressCodeData: dressCodeDataType[],
    dressCodeIncentives: dressCodeIncentiveType[]
  }
}

export default function GovernmentDressCode() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const [getDressCodeState, setGetDressCodeState] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [dressCodes, setDressCodes] = useState<dressCodeType[]>([])

  async function loadData() {
    const result = await getDressCodeData()
    setGetDressCodeState(result.result)
    if (result.result === loadingStateEnum.success) {
      setDressCodes(result.data)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
        <Link to="/profile/government/calendar">
          <Text>Back</Text>
        </Link>
      <Text>Dress Codes</Text>
      <View>
        { (getDressCodeState === loadingStateEnum.loading) ?
          <Text>Loading</Text>:
          <View>
            { (getDressCodeState === loadingStateEnum.success) ?
              <View>
                { dressCodes.map((dressCode) => (
                  <ListItem to={'/profile/government/calendar/dresscode/edit/' + dressCode.id} title={dressCode.name} width={width} />
                ))}
              </View>:<Text>Failed</Text>
            }
          </View>
        }
      </View>
      <Link to="/profile/government/calendar/dresscode/create">
        <Text>Create Dress Code</Text>
      </Link>
    </View>
  )
}