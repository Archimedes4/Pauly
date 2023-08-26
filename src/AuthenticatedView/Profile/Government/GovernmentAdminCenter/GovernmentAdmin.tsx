import { View, Text, Button, Pressable, TextInput } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { loadingStateEnum } from '../../../../types';
import { Link } from 'react-router-native';
import callMsGraph from '../../../../Functions/microsoftAssets';
import { initializePaulyPartOne, initializePaulyPartThree, initializePaulyPartTwo } from '../../../../Functions/initializePauly/initializePauly'
import { useSelector } from 'react-redux';
import { RootState } from '../../../../Redux/store';

enum initStage {
  notStarted,
  partOne,
  partTwoLoad,
  partTwo,
  partThreeLoad,
  partThree
}

export default function GovernmentAdmin() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)
  
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [loadedUsers, setLoadedUsers] = useState<microsoftUserType[]>([])
  const [selectedUser, setSelectedUser] = useState<microsoftUserType | undefined>(undefined)
  const [startTime, setStartTime] = useState<Date>(new Date())
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [createdGroupId, setCreatedGroupId] = useState<string>("")

  //Result
  const [initResult, setInitResult] = useState<loadingStateEnum>(loadingStateEnum.cannotStart)
  const [initTwoResult, setInitTwoResult] = useState<loadingStateEnum>(loadingStateEnum.cannotStart)
  const [initThreeResult, setInitThreeResult] = useState<loadingStateEnum>(loadingStateEnum.cannotStart)
  const [loadUsersResult, setLoadUsersResult] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const [currentInitStage, setCurrentInitStage] = useState<initStage>(initStage.notStarted)

  async function initializePauly() {
    if (selectedUser !== undefined) {
      setStartTime(new Date())
      setCurrentInitStage(initStage.partOne)
      setInitResult(loadingStateEnum.loading)
      const partOneResult = await initializePaulyPartOne(selectedUser.id)
      if (partOneResult.result === loadingStateEnum.success && partOneResult.groupId !== undefined){
        setCreatedGroupId(partOneResult.groupId)
        setInitTwoResult(loadingStateEnum.notStarted)
        setCurrentInitStage(initStage.partTwoLoad)
        const partTwoResult = await new Promise<loadingStateEnum>((resolve) => {
          setTimeout(async () => {
            setCurrentInitStage(initStage.partTwo)
            const secondResult = await initializePaulyPartTwo(partOneResult.groupId)
            resolve(secondResult);
          }, 900000);
        });
        if (partTwoResult === loadingStateEnum.success){
          setCurrentInitStage(initStage.partThreeLoad)
          const partThreeResult = await new Promise<loadingStateEnum>((resolve) => {
            setTimeout(async () => {
              setCurrentInitStage(initStage.partThree)
              const thirdResult = await initializePaulyPartThree(partOneResult.groupId)
              resolve(thirdResult);
            }, 900000);
          });
          if (partThreeResult === loadingStateEnum.success) {
            setInitResult(loadingStateEnum.success)
          } else {
            setInitResult(loadingStateEnum.failed)
          }
        } else {
          setInitResult(loadingStateEnum.failed) 
        }
      } else {
        setInitResult(loadingStateEnum.failed) 
      }
    }
  }

  async function initializePaulyFromPartTwo() {
    if (createdGroupId !== "" && initTwoResult === loadingStateEnum.notStarted) {
      setInitTwoResult(loadingStateEnum.loading)      
      const secondResult = await initializePaulyPartTwo(createdGroupId)
      if (secondResult === loadingStateEnum.success) {
        setInitTwoResult(loadingStateEnum.success)
      } else {
        setInitTwoResult(loadingStateEnum.failed)
      }
    }
  }

  async function initializePaulyFromPartThree() {
    if (createdGroupId !== "" && initThreeResult === loadingStateEnum.notStarted) {
      setInitThreeResult(loadingStateEnum.loading)
      const result = await initializePaulyPartThree(createdGroupId)
      if (result === loadingStateEnum.success) {
        setInitTwoResult(loadingStateEnum.success)
      } else {
        setInitThreeResult(loadingStateEnum.failed)
      }
    }
  }

  async function getUserId() {
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/me")
    if (result.ok) {
      const data = await result.json()
      setCurrentUserId(data["id"])
    }
  }

  async function getUsers() {
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/users?$top=10")
    if (result.ok){
      const data = await result.json()
      var newUsers: microsoftUserType[] = []
      for (var index = 0; index < data["value"].length; index++){
        newUsers.push({
          id: data["value"][index]["id"],
          displayName: data["value"][index]["displayName"]
        })
      }
      setLoadedUsers(newUsers)
      setLoadUsersResult(loadingStateEnum.success)
    } else {
      setLoadUsersResult(loadingStateEnum.failed)
    }
  }

  useEffect(() => {
    if (currentInitStage === initStage.partTwoLoad || currentInitStage === initStage.partThreeLoad) {
      const interval = setInterval(() => {
        const miliSecondsPassed = new Date().getTime() - startTime.getTime()
        const miliSecondsLeft = 1800000 - miliSecondsPassed
        const totalSecondsLeft = miliSecondsLeft/1000
        var minutesLeft: number = Math.floor(totalSecondsLeft/60)
        var secondsLeft: number = Math.ceil(totalSecondsLeft%60)
        if (secondsLeft === 60){
          minutesLeft++
          secondsLeft = 0
        }
        var minutesLeftString: string = minutesLeft.toString()
        var secondsLeftString: string = secondsLeft.toString()
        if (minutesLeft <= 9){
          minutesLeftString = "0" + minutesLeftString
        }
        if (secondsLeft <= 9){
          secondsLeftString = "0" + secondsLeft
        }
        setTimeLeft(minutesLeftString + ":" + secondsLeftString)
        if (minutesLeft <= -1){
          setTimeLeft("0:0")
          return clearInterval(interval);
        }
      }, 1000);
  
      return () => clearInterval(interval);
    }
  }, [currentInitStage])

  useEffect(() => {
    getUserId()
    getUsers()
  }, [])

  useEffect(() => {
    if (createdGroupId !== ""){
      setInitTwoResult(loadingStateEnum.notStarted)
      setInitThreeResult(loadingStateEnum.notStarted)
    }
  }, [createdGroupId])

  return (
    <View style={{height: height, width: width, backgroundColor: "white"}}>
      <Link to="/profile/government">
        <Text>Back</Text>
      </Link>
      <View>
        { (loadUsersResult === loadingStateEnum.loading) ?
          <Text>Loading</Text>:
          <View>
            { (loadUsersResult === loadingStateEnum.success) ?
              <View>
                {loadedUsers.map((user) => (
                  <View key={"User_"+user.id}>
                    { (user.id !== currentUserId) ?
                      <Pressable onPress={() => {setSelectedUser(user); setInitResult(loadingStateEnum.notStarted)}}>
                        <View>
                          <Text>{user.displayName}</Text>
                        </View>
                      </Pressable>:null
                    }
                  </View>
                ))}
              </View>:<Text>Failed</Text>
            }
          </View>
        }
      </View>
      <TextInput value={createdGroupId} onChangeText={setCreatedGroupId} placeholder='Group Id'/>
      <View>
        <View style={{height: height * 0.1, width: height* 0.1}}/>
        <View />
        <View />
      </View>
      <Pressable onPress={() => {if (initResult === loadingStateEnum.notStarted) {initializePauly()}}}>
        <Text>{(initResult === loadingStateEnum.cannotStart) ?  "Please Pick a User":(initResult === loadingStateEnum.notStarted) ? "initialize Pauly on New Tenant":(initResult ===  loadingStateEnum.loading) ? "Loading " + timeLeft :(initResult === loadingStateEnum.success) ? "Success":"Failed"}</Text>
      </Pressable>
      { (initTwoResult !== loadingStateEnum.cannotStart) ?
        <Pressable onPress={() => {initializePaulyFromPartTwo()}}>
          <Text>{(initTwoResult === loadingStateEnum.notStarted) ? "Start From Part Two":(initTwoResult === loadingStateEnum.loading) ? "Loading":(initTwoResult === loadingStateEnum.success) ? "Success":"Failed"}</Text>
        </Pressable>:null
      }
      { (initThreeResult !== loadingStateEnum.cannotStart) ?
        <Pressable onPress={() => {initializePaulyFromPartThree()}}>
          <Text>{(initThreeResult === loadingStateEnum.notStarted) ? "Start From Part Three":(initThreeResult === loadingStateEnum.loading) ? "Loading":(initThreeResult === loadingStateEnum.success) ? "Success":"Failed"}</Text>
        </Pressable>:null
      }
    </View>
  )
}