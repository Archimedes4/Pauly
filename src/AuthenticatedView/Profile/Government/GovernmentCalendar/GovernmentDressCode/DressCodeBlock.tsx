import { useSelector } from "react-redux"
import { RootState } from "../../../../../Redux/store"
import { Pressable, View, Text, TextInput } from "react-native"
import { CloseIcon, DownIcon, UpIcon, WarningIcon } from "../../../../../UI/Icons/Icons"
import React from "react"

export default function DressCodeBlock({dressCode, index, dressCodeData, setDressCodeData, selectedDressCodeId, setSelectedDressCodeId}:{dressCode: dressCodeDataType, index: number, dressCodeData: dressCodeDataType[], setDressCodeData: (item: dressCodeDataType[]) => void, selectedDressCodeId: string, setSelectedDressCodeId: (item: string) => void}) {
    const {width, height} = useSelector((state: RootState) => state.dimentions)
    return (
      <Pressable onPress={() => {setSelectedDressCodeId(dressCode.id)}} style={{shadowColor: "black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, borderRadius: 15, marginLeft: width * 0.03, marginRight: width * 0.03, marginTop: height * 0.02, marginBottom: height * 0.02}}>
        <View style={{margin: 10, flexDirection: "row"}}>
          <View>
            <View style={{flexDirection: "row"}}>
              { (dressCode.name === "") ?
                <WarningIcon width={14} height={14} outlineColor='red'/>:null
              }
              <Text>Name: {(selectedDressCodeId === dressCode.id) ? "":dressCode.name}</Text>
              {(selectedDressCodeId === dressCode.id) ?
                <TextInput 
                  placeholder='Dress Code Name'
                  value={dressCode.name}
                  onChangeText={(e) => {
                    var newDressCodeData = dressCodeData
                    newDressCodeData[index].name = e
                    setDressCodeData([...newDressCodeData])
                  }}
                />:null
              }
            </View>
            <View style={{flexDirection: "row"}}>
              { (dressCode.description === "") ?
                <WarningIcon width={14} height={14} outlineColor='red'/>:null
              }
              <Text>Description: {(selectedDressCodeId === dressCode.id) ? "":dressCode.description}</Text>
              {(selectedDressCodeId === dressCode.id) ?
                <TextInput 
                  placeholder='Dress Code Description'
                  value={dressCode.description}
                  onChangeText={(e) => {
                    var newDressCodeData = dressCodeData
                    newDressCodeData[index].description = e
                    setDressCodeData([...newDressCodeData])
                  }}
                />:null
              }
            </View>
          </View>
          <View>
            <UpIcon width={14} height={14} />
            <DownIcon  width={14} height={14} />
            <CloseIcon width={14} height={14} />
          </View>
        </View>
      </Pressable>
    )
}