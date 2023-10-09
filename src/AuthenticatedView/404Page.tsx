import { View, Text, Pressable } from 'react-native'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-native'
import { useSelector } from 'react-redux'
import { RootState } from '../Redux/store'

export default function PageNotFound() {
  const {height, width} = useSelector((state: RootState) => state.dimentions)
  const [isBottonHover, setIsButtonHover] = useState<boolean>(false)
  const navigate = useNavigate();
  return (
    <View style={{width: width, height: height, backgroundColor: "white", alignContent: "center", alignItems: "center", justifyContent: "center"}}>
      <Text>Page Not Found</Text>
      <Pressable onPress={() => {navigate("/")}} onHoverIn={() => {setIsButtonHover(true)}} onHoverOut={() => {setIsButtonHover(false)}} style={{height: height * 0.09, width: width * 0.5, borderRadius: 50, backgroundColor: isBottonHover ? "#444444":"white", alignContent: "center", alignItems: "center", justifyContent: "center", shadowColor: isBottonHover ? "white":"black", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10, marginTop: (width < height) ? width * 0.1:height * 0.1}}>
        <Text style={{textAlign: "center", color: isBottonHover ? "white":"black", fontWeight: "bold"}}>RETURN HOME</Text>
      </Pressable>
    </View>
  )
}