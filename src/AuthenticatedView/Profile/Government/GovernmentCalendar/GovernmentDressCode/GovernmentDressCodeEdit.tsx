import { View, Text, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { RootState } from '../../../../../Redux/store'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-native'
import callMsGraph from '../../../../../Functions/Ultility/microsoftAssets'
import { loadingStateEnum } from '../../../../../types'
import getDressCode from '../../../../../Functions/Homepage/getDressCode'

export default function GovernmentDressCodeEdit() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  const {id} = useParams()

  const [getDressCodeState, setDressCodeState] = useState<loadingStateEnum>(loadingStateEnum.loading)

  async function loadData() {
    const result = await getDressCode(id)
    if (result.result === loadingStateEnum.success && result.data !== undefined) {
      
    }
    setDressCodeState(result.result)
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <View style={{width: width, height: height, backgroundColor: "white"}}>
      <Link to="/profile/government/calendar/dresscode">
        <Text>Back</Text>
      </Link>
      <Text>GovernmentDressCodeEdit</Text>
      <Pressable>
        <Text>Delete Dress Code</Text>
      </Pressable>
      <Pressable>
        <Text>Save</Text>
      </Pressable>
    </View>
  )
}