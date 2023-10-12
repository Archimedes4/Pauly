import { View, Text, Pressable } from 'react-native'
import React, { useState } from 'react'
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets'
import { loadingStateEnum } from '../../../../types'
import { Link, useParams } from 'react-router-native'
import { RootState } from '../../../../Redux/store'
import { useSelector } from 'react-redux'

export default function MicrosoftGraphEditExtension() {
    const {height, width} = useSelector((state: RootState) => state.dimentions)
    const { mode, id } = useParams()

    const [extensionLoadingState, setExtensionLoadingState] = useState<loadingStateEnum>(loadingStateEnum.loading)
    const [deleteExtensionLoadingState, setDeleteExtensionLoadingState] = useState<loadingStateEnum>(loadingStateEnum.notStarted)

    const [extensionDescription, setExtensionDescription] = useState<string>("")

    async function getExtension() {
        const result = await callMsGraph("https://graph.microsoft.com/v1.0/schemaExtensions?$filter=id%20eq%20'" + id + "'")
        if (result.ok){
            const data = await result.json()
            if (data["value"].length === 1) {
                setExtensionDescription(data["value"][0]["description"])
                setExtensionLoadingState(loadingStateEnum.success)
            } else {
                setExtensionLoadingState(loadingStateEnum.failed)
            }
        } else {
            setExtensionLoadingState(loadingStateEnum.failed)
        }
    }
    async function deleteExtension() {
        if (deleteExtensionLoadingState === loadingStateEnum.notStarted || deleteExtensionLoadingState === loadingStateEnum.failed){
            setDeleteExtensionLoadingState(loadingStateEnum.loading)
            const result = await callMsGraph("https://graph.microsoft.com/v1.0/schemaExtensions/" + id, "DELETE")
            if (result.ok){
                setDeleteExtensionLoadingState(loadingStateEnum.success)
            } else {
                setDeleteExtensionLoadingState(loadingStateEnum.failed)
            }   
        }
    }
  return (
    <View style={{overflow: "hidden", height: height, width: width, backgroundColor: Colors.white}}>
        <Link to={"/profile/government/graph/" + mode}>
            <Text>Back</Text>
        </Link>
      <Text>MicrosoftGraphEditExtension</Text>
      <View>

      </View>
      <Pressable onPress={() => {deleteExtension()}}>
        <Text>{(deleteExtensionLoadingState === loadingStateEnum.notStarted) ? "Delete Extension":(deleteExtensionLoadingState === loadingStateEnum.loading) ? "Loading":(deleteExtensionLoadingState === loadingStateEnum.success) ? "Successfully Deleted Extension":"Failed To Delete Extension"}</Text>
      </Pressable>
    </View>
  )
}