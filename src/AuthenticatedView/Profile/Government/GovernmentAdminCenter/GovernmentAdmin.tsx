import { View, Text, Button, Pressable, TextInput } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { loadingStateEnum } from '../../../../types';
import { Link } from 'react-router-native';
import callMsGraph from '../../../../Functions/microsoftAssets';
import { initializePaulyPartOne, initializePaulyPartThree, initializePaulyPartTwo } from '../../../../Functions/initializePauly/initializePauly'

export default function GovernmentAdmin() {
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
  
  async function initializePauly() {
    if (selectedUser !== undefined) {
      setStartTime(new Date())
      setInitResult(loadingStateEnum.loading)
      const partOneResult = await initializePaulyPartOne(selectedUser.id)
      if (partOneResult.result === loadingStateEnum.success && partOneResult.groupId !== undefined){
        setCreatedGroupId(partOneResult.groupId)
        setInitTwoResult(loadingStateEnum.notStarted)
        const partTwoResult = await new Promise<loadingStateEnum>((resolve) => {
          setTimeout(async () => {
            const secondResult = await initializePaulyPartTwo(partOneResult.groupId)
            resolve(secondResult);
          }, 900000);
        });
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
    if (initResult === loadingStateEnum.loading) {
      const interval = setInterval(() => {
        const miliSecondsPassed = new Date().getTime() - startTime.getTime()
        const miliSecondsLeft = 900000 - miliSecondsPassed
        const totalSecondsLeft = miliSecondsLeft/1000
        var minutesLeft = Math.floor(totalSecondsLeft/60)
        var secondsLeft = Math.ceil(totalSecondsLeft%60)
        if (secondsLeft === 60){
          minutesLeft++
          secondsLeft = 0
        }
        setTimeLeft(minutesLeft + ":" + secondsLeft)
        if (minutesLeft <= -1){
          setTimeLeft("0:0")
          return clearInterval(interval);
        }
      }, 1000);
  
      return () => clearInterval(interval);
    }
  }, [initResult])

  useEffect(() => {
    getUsers()
  }, [])

  useEffect(() => {
    if (createdGroupId !== ""){
      setInitTwoResult(loadingStateEnum.notStarted)
      setInitThreeResult(loadingStateEnum.notStarted)
    }
  }, [createdGroupId])

  return (
    <View>
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
                  <Pressable onPress={() => {setSelectedUser(user); setInitResult(loadingStateEnum.notStarted)}} key={"User_"+user.id}>
                    <View>
                      <Text>{user.displayName}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>:<Text>Failed</Text>
            }
          </View>
        }
      </View>
      <TextInput value={createdGroupId} onChangeText={setCreatedGroupId} placeholder='Group Id'/>
      <Button title={(initResult === loadingStateEnum.notStarted) ? "initialize Pauly on New Tenant":(initResult ===  loadingStateEnum.loading) ? "Loading " + timeLeft :(initResult === loadingStateEnum.success) ? "Success":"Failed"} onPress={() => {if (initResult === loadingStateEnum.notStarted) {initializePauly()}}}/>
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