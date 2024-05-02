import { View, Text, Pressable, Modal } from 'react-native'
import React, { useState } from 'react'
import { Colors } from '@constants'
import { VectorIconPicker } from '@components/Icons/VectorIcon'
import { RootState } from '@redux/store'
import { useSelector } from 'react-redux'

export default function CommissionsImage({
  selectedIcon,
  onPickIcon
}:{
  selectedIcon: vectorIconType | undefined
  onPickIcon: (item: vectorIconType | undefined) => void
}) {
  const [isPickingVector, setIsPickingVector] = useState<boolean>(false)
  const [isPickingImage, setIsPickingImage] = useState<boolean>(false)
  const { height, totalWidth } = useSelector(
    (state: RootState) => state.dimensions,
  );
  return (
    <View
      style={{
        marginLeft: 15,
        marginRight: 15,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        borderRadius: 15,
        padding: 10,
        marginTop: 10,
        backgroundColor: Colors.white,
      }}
    >
      <Modal visible={isPickingVector}>
        <Pressable onPress={() => {
          setIsPickingVector(false)
        }}>
          Close
        </Pressable>
        <VectorIconPicker style={{
          marginHorizontal: (totalWidth % 80)/2
        }} onPickIcon={onPickIcon} selectedIcon={selectedIcon} width={totalWidth - (totalWidth % 80)} height={height * 0.8}/>
      </Modal>
      <Modal visible={isPickingImage}>

      </Modal>
      <Pressable onPress={() => {
        setIsPickingVector(true)
      }}>
        <Text>Select Icon</Text>
      </Pressable>
      <Pressable>
        <Text>Select Image</Text>
      </Pressable>
    </View>
  )
}