import { View, Text, Pressable, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { loadingStateEnum } from '../../../../types';
import { useNavigate } from 'react-router-native';
import callMsGraph from '../../../../Functions/Ultility/microsoftAssets';
import { initializePaulyPartOne, initializePaulyPartThree, initializePaulyPartTwo } from '../../../../Functions/initializePauly/initializePauly'
import { useSelector } from 'react-redux';
import { RootState } from '../../../../Redux/store';
import { addDataArray } from '../../../../Functions/initializePauly/initializePaulyData';

enum initStage {
  notStarted,
  partOne,
  partTwoLoad,
  partTwo,
  partThreeLoad,
  partThree,
  done
}

export default function GovernmentAdmin() {
  const {width, height} = useSelector((state: RootState) => state.dimentions)

  const [selectedUser, setSelectedUser] = useState<microsoftUserType | undefined>(undefined)
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [timeElapsed, setTimeElapsed] = useState<string>("Not Started")
  const [createdGroupId, setCreatedGroupId] = useState<string>("")
  const [selectedUpdates, setSelectedUpdates] = useState<string[]>([])
  const navigate = useNavigate()

  //Start Times
  const [startTime, setStartTime] = useState<Date>(new Date())
  const [partOneStartTime, setPartOneStartTime] = useState<Date>(new Date())
  const [partTwoStartTime, setPartTwoStartTime] = useState<Date>(new Date())

  //Result
  const [initResult, setInitResult] = useState<loadingStateEnum>(loadingStateEnum.cannotStart)
  const [initTwoResult, setInitTwoResult] = useState<loadingStateEnum>(loadingStateEnum.cannotStart)
  const [initThreeResult, setInitThreeResult] = useState<loadingStateEnum>(loadingStateEnum.cannotStart)
  const [currentInitStage, setCurrentInitStage] = useState<initStage>(initStage.notStarted)

  async function initializePauly() {
    if (selectedUser !== undefined) {
      setStartTime(new Date())
      setCurrentInitStage(initStage.partOne)
      setInitResult(loadingStateEnum.loading)
      const partOneResult = await initializePaulyPartOne(selectedUser.id)
      if (partOneResult.result === loadingStateEnum.success && partOneResult.groupId !== undefined){
        setCreatedGroupId(partOneResult.groupId)
        setCurrentInitStage(initStage.partTwoLoad)
        setPartOneStartTime(new Date())
        const partTwoResult = await new Promise<loadingStateEnum>((resolve, reject) => {
          setTimeout(async () => {
            if (partOneResult.groupId !== undefined) {
              setCurrentInitStage(initStage.partTwo)
              const secondResult = await initializePaulyPartTwo(partOneResult.groupId)
              resolve(secondResult);
            } else {
              setCurrentInitStage(initStage.done)
              setInitResult(loadingStateEnum.failed) 
              reject()
            }
          }, 900000);
        });
        if (partTwoResult === loadingStateEnum.success){
          setCurrentInitStage(initStage.partThreeLoad)
          setPartTwoStartTime(new Date())
          const partThreeResult = await new Promise<loadingStateEnum>((resolve, reject) => {
            setTimeout(async () => {
              if (partOneResult.groupId !== undefined) {
                setCurrentInitStage(initStage.partThree)
                const thirdResult = await initializePaulyPartThree(partOneResult.groupId)
                resolve(thirdResult);
              } else {
                setCurrentInitStage(initStage.done)
                setInitResult(loadingStateEnum.failed) 
                reject()
              }
            }, 900000);
          });
          if (partThreeResult === loadingStateEnum.success) {
            setInitResult(loadingStateEnum.success)
            setCurrentInitStage(initStage.done)
          } else {
            setCurrentInitStage(initStage.done)
            setInitResult(loadingStateEnum.failed)
          }
        } else {
          setCurrentInitStage(initStage.done)
          setInitResult(loadingStateEnum.failed) 
        }
      } else {
        setCurrentInitStage(initStage.done)
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
      setStartTime(new Date())
      setCurrentInitStage(initStage.partThree)
      setInitThreeResult(loadingStateEnum.loading)
      const result = await initializePaulyPartThree(createdGroupId, selectedUpdates)
      if (result === loadingStateEnum.success) {
        setInitThreeResult(loadingStateEnum.success)
        setCurrentInitStage(initStage.done)
      } else {
        setInitThreeResult(loadingStateEnum.failed)
        setCurrentInitStage(initStage.done)
      }
    }
  }

  useEffect(() => {
    if (currentInitStage === initStage.partTwoLoad || currentInitStage === initStage.partThreeLoad) {
      const interval = setInterval(() => {
        var miliSecondsPassed = new Date().getTime() - startTime.getTime()
        if (currentInitStage === initStage.partTwoLoad) {
          miliSecondsPassed = new Date().getTime() - partOneStartTime.getTime()
        } else if (currentInitStage === initStage.partThreeLoad) {
          miliSecondsPassed = new Date().getTime() - partTwoStartTime.getTime()
        }
        
        const miliSecondsLeft = 900000 - miliSecondsPassed
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
    console.log("Logged")
    if (currentInitStage !== initStage.notStarted) {
      console.log("Logged 1")
      const interval = setInterval(() => {
        var miliSecondsPast = new Date().getTime() - startTime.getTime()
        
        const totalSecondsLeft = miliSecondsPast/1000
        var totalMinutesPast: number = Math.floor(totalSecondsLeft/60)
        var minutesPast: number = Math.ceil(totalMinutesPast%60)
        var hoursPast: number = Math.floor(totalMinutesPast/60)
        var secondsPast: number = Math.ceil(totalSecondsLeft%60)
        if (secondsPast === 60){
          minutesPast++
          secondsPast = 0
        }
        var hoursLeftString: string = hoursPast.toString()
        var minutesLeftString: string = minutesPast.toString()
        var secondsLeftString: string = secondsPast.toString()
        if (minutesPast <= 9){
          minutesLeftString = "0" + minutesLeftString
        }
        if (secondsPast <= 9){
          secondsLeftString = "0" + secondsPast
        }
        if (hoursPast <= 9){
          hoursLeftString = "0" + hoursLeftString
        }
        setTimeElapsed(hoursLeftString + ":" + minutesLeftString + ":" + secondsLeftString)
      }, 1000);
      if (currentInitStage === initStage.done) {
        console.log("Cleared")
        return clearInterval(interval);
      }
      return () => clearInterval(interval);
    }
  }, [currentInitStage])

  useEffect(() => {
    if (createdGroupId !== "" && (initResult === loadingStateEnum.notStarted || initResult === loadingStateEnum.cannotStart || initResult === loadingStateEnum.failed)){
      setInitTwoResult(loadingStateEnum.notStarted)
      setInitThreeResult(loadingStateEnum.notStarted)
    }
  }, [createdGroupId, initResult])

  return (
    <View style={{height: height, width: width, backgroundColor: "white"}}>
      <View>
        <Pressable onPress={() => navigate("/profile/government")}>
          <Text>Back</Text>
        </Pressable>
      </View>
      <View style={{flexDirection: "row"}}>
        <View>
          <View style={{height: height * 0.25, width: height * 0.1, alignContent: "center", justifyContent: "center", alignItems: "center"}}>
            <View style={{height: height * 0.05, width: height* 0.05, backgroundColor: (currentInitStage === initStage.partOne) ? "blue":"black", borderRadius: 50}}/>
            <View style={{height: height * 0.025, width: height* 0.05, alignItems: "center", justifyContent: "center", alignContent: "center"}}>
              <View style={{height: height * 0.025, width: height * 0.005, backgroundColor: (currentInitStage === initStage.partTwoLoad) ? "blue":"black",}}/>
              { (currentInitStage === initStage.partTwoLoad) ?
                <Text style={{position: "absolute", left: height * 0.03, top: height * 0.01}}>{timeLeft}</Text>:null
              }
            </View>
            <View style={{height: height * 0.05, width: height* 0.05, backgroundColor: (currentInitStage === initStage.partTwo) ? "blue":"black", borderRadius: 50}}/>
            <View style={{height: height * 0.025, width: height* 0.05, alignItems: "center", justifyContent: "center", alignContent: "center"}}>
              <View style={{height: height * 0.025, width: height * 0.005, backgroundColor: (currentInitStage === initStage.partThreeLoad) ? "blue":"black",}}/>
              { (currentInitStage === initStage.partThreeLoad) ?
                <Text style={{position: "absolute", left: height * 0.03, top: height * 0.01}}>{timeLeft}</Text>:null
              }
            </View>
            <View style={{height: height * 0.05, width: height* 0.05, backgroundColor: (currentInitStage === initStage.partThree) ? "blue":"black", borderRadius: 50}}/>
          </View>
        </View>
        <View>
          <UserBlock setSelectedUser={setSelectedUser} setInitResult={setInitResult} />
          <TextInput value={createdGroupId} onChangeText={setCreatedGroupId} placeholder='Group Id'/>
          <Text>Time Elapsed: {timeElapsed}</Text>
          <Pressable onPress={() => {if (initResult === loadingStateEnum.notStarted) {initializePauly()}}}>
            <Text>{(initResult === loadingStateEnum.cannotStart) ?  "Please Pick a User":(initResult === loadingStateEnum.notStarted) ? "initialize Pauly on New Tenant":(initResult ===  loadingStateEnum.loading) ? "Loading " + timeLeft :(initResult === loadingStateEnum.success) ? "Success":"Failed"}</Text>
          </Pressable>
          { (initTwoResult !== loadingStateEnum.cannotStart) ?
            <Pressable onPress={() => {initializePaulyFromPartTwo()}}>
              <Text>{(initTwoResult === loadingStateEnum.notStarted) ? "Start From Part Two":(initTwoResult === loadingStateEnum.loading) ? "Loading":(initTwoResult === loadingStateEnum.success) ? "Success":"Failed"}</Text>
            </Pressable>:null
          }
          { (initThreeResult !== loadingStateEnum.cannotStart) ?
            <View>
              {addDataArray.map((addData) => (
                <View key={"Add_Data_" + addData.id}>
                  { (selectedUpdates.includes(addData.id)) ?
                    <Pressable style={{width: width * 0.7, backgroundColor: "blue"}} onPress={() => {
                      var newSelectedUpdates = selectedUpdates
                      newSelectedUpdates.filter((e) => {return e !== addData.id})
                      setSelectedUpdates([...newSelectedUpdates])
                    }}>
                      <View style={{margin: 5}}>
                        <Text>{addData.id}</Text>
                      </View>
                    </Pressable>:
                    <Pressable style={{width: width * 0.7, backgroundColor: "white"}} onPress={() => {
                      setSelectedUpdates([...selectedUpdates, addData.id])
                    }}>
                      <View style={{margin: 5}}>
                        <Text>{addData.id}</Text>
                      </View>
                    </Pressable>
                  }
                </View>
              ))}
              <Pressable onPress={() => {initializePaulyFromPartThree()}}>
                <Text>{(initThreeResult === loadingStateEnum.notStarted) ? "Start From Part Three":(initThreeResult === loadingStateEnum.loading) ? "Loading":(initThreeResult === loadingStateEnum.success) ? "Success":"Failed"}</Text>
              </Pressable>
            </View>:null
          }
        </View>
      </View>
    </View>
  )
}

function UserBlock({setSelectedUser, setInitResult}:{setSelectedUser: (item: microsoftUserType) => void, setInitResult: (item: loadingStateEnum) => void}) {
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [loadedUsers, setLoadedUsers] = useState<microsoftUserType[]>([])
  const [loadUsersResult, setLoadUsersResult] = useState<loadingStateEnum>(loadingStateEnum.loading)
  const {height} = useSelector((state: RootState) => state.dimentions)
  
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
    getUserId()
    getUsers()
  }, [])
  return (
    <>
      <View style={{height: height * 0.1}}>
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
    </>
  )
}