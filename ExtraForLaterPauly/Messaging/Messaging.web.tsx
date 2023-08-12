import { View, Text, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Button, Pressable, ScrollView, TextInput, TextInputKeyPressEventData, Image } from 'react-native'
import React, { useEffect, useRef, useState, useContext } from 'react'
import { Link } from 'react-router-native'
import NavBarComponent from '../src/UI/NavComponent';
import { accessTokenContent } from '../App';
import callMsGraph from '../src/Functions/microsoftAssets';
import SendMessageComponent from './SendMessageComponent';
import SanatizeHTML from '../src/UI/SanatizeHTML/SanatizeHTML.web';
import { create } from 'react-test-renderer';
import create_UUID from '../src/Functions/CreateUUID';

declare global {
  type ChatMessageMode = "oneOnOne" | "group"
  type MemberType = {
    displayName: string
    id: string
  }
  type ChatType = {
    chatMode: ChatMessageMode
    id: string
    lastMessage: MessageData
    members: MemberType[]
  }
  type MessageData = {
    content: string
    from: MemberType
  }
}

enum MessagingMode {
  Pick,
  Chat
}

const privateKey = "MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAM1sdGtvwEpaMbqGwDaCSXadCSdNDwIYMmiIhuLBO1LDEHxpAaCKaNaBZs0haNCpEW6i8581DUho9eSw0DmgwM7sT11q0Xz4mtd4iineIEeUcXb3MKK7RpxU/oP+ddEDmXGPJ2H4a/F5Bx2pvFvr3g28jQtv+G8pCtFLZrAzbaw9AgMBAAECgYAuclE4YYIWzaHkzMb1DCxUF1mUe0XjcVkkbYoiBxLEubomhw+JHwJpTcTSqLUsSK3aWBnBa5tfPewrExdhkElHmETBcuL5DUqf/hhTTmqkCYMgivvjkgPwXaBNsvGK029+iin2mh94hNP6muRebl/RdsvkZeVoqRZg3MbE3miSuQJBAOvR7K5iC88GZ8AbF3TGz1bdj0KUOTfEsJHufW53+sEs3w6pDlETqRa5DwHoyVdcXpt25anMu3ef1W/TNBVQrnsCQQDfAKQw553wH95Pj7Mr/Ct/I29+xUc9PG3cIt5SXOUiffPggaFuFwlSBaUVGXMXAeB+hx0jvg6Xn61nR01ziW6nAkAfU5m/aKLs84rgyDiLeMWeYnxfedVIBUb3e9kJzcJv2wgeqHKQbq4tqJPHyybEBi9DM746mknlEESIQGRQ2JD1AkEAw/+rT/RywzcvTJxPbQxhKoh5mWFJANBY+o+G+br+BTfQnnUw7jK/FWEyu/23QvR6XJriiKSl7KwCW3C26SJUpwJBAIV3Vb3lrX29Ks5dSgZdU56V1W6IEX0Fpqx/QW7LsWZqwYlXdCITWv9lB6TBctaGwB/2VZpreIhThmjcIwMIzh4="
const publicKey = "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"

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

enum loadingResult {
  loading,
  success,
  unauthorized,
  failure
}

export default function Message() {
    const microsoftAccessToken = useContext(accessTokenContent);
    const [currentLoadingResultMessages, setCurrentLoadingResultMessages] = useState<loadingResult>(loadingResult.loading)
    const [currentLoadingResultChat, setCurrentLoadingResultChat] = useState<loadingResult>(loadingResult.loading)
    const [chats, setChats] = useState<ChatType[]>([])
    const [selectedChat, setSelectedChat] =  useState<ChatType>()
    const [selectedChatMessages, setSelectedChatMessages] = useState<MessageData[]>([])
    const [userID, setUserID] = useState<string>("")
    const chatDivRef = useRef(null)
    const [nextLink, setNextLink] = useState<string>("")
    const [isEndOfChat, setIsEndOfChat] = useState<boolean>(false)
    const [dimensions, setDimensions] = useState({
        window: windowDimensions,
        screen: screenDimensions,
    });

    const [newMessageText, setNewMessageText] = useState<string>("")

    useEffect(() => {
        const subscription = Dimensions.addEventListener(
            'change',
            ({window, screen}) => {
                setDimensions({window, screen});
            },
        );
        return () => subscription?.remove();
    });

  async function getChats(url: string) {
    const response = await callMsGraph(microsoftAccessToken.accessToken, url)
    if (response.ok){
      const data = await response.json()
      console.log("This is data", data, url)
      var newChats: ChatType[] = []
      for(var index = 0; index < data["value"].length; index++){
        const messageData = data["value"][index]
        var members: MemberType[] = []
        for(var mebIndex = 0; mebIndex < messageData["members"].length; mebIndex++){
          members.push(
            {
              displayName: messageData["members"][mebIndex]["displayName"],
              id: messageData["members"][mebIndex]["userId"]
            }
          )
        }
        // console.log(messageData["lastMessagePreview"]["from"]["user"]["id"])
        console.log(members)
        var lastMessage: MessageData = {
          content: "No Messages Found",
          from: {displayName: "", id: "Null"}
        }
        if (messageData["lastMessagePreview"] !== null && members.length > 1){
          const senderIndex = members.findIndex((element: MemberType) => element.id === messageData["lastMessagePreview"]["from"]["user"]["id"])
          lastMessage = {
            content: messageData["lastMessagePreview"]["body"]["content"], //TO DO make sure not undefined
            from: members[senderIndex]
          }
        } else {
          //TO DO handle error
        }
        // console.log("This is member", lastMessage)
        newChats.push({
          chatMode: messageData["chatType"],
          id: messageData["id"],
          lastMessage: lastMessage,
          members: members
        })
      }
      if (newChats.length >= 1){
        setSelectedChat(newChats[0])
      }
      setChats(newChats)
      setCurrentLoadingResultChat(loadingResult.success)
    } else {
      setCurrentLoadingResultChat(loadingResult.failure)
    }
  }
  async function getChatMessages(chatUrl: string, previousMessages: MessageData[]) {
    const response = await callMsGraph(microsoftAccessToken.accessToken, chatUrl)
    if (response.ok){
      const data = await response.json()
      var newMessages: MessageData[] = []
      for(var index = 0; index < data["value"].length; index++){
        if (selectedChat !== undefined) {
          if (data["value"][index]["from"] !== null && selectedChat.members.length > 1){
            const senderIndex = selectedChat.members.findIndex((element: MemberType) => element.id === data["value"][index]["from"]["user"]["id"])
            if (senderIndex !== undefined){
                newMessages.push(
                    {
                      content: data["value"][index]["body"]["content"],
                      from: selectedChat.members[senderIndex]
                    }
                )
            }
          } else {
            if (selectedChat.members.length > 0) {
              newMessages.push(
                {
                  content: data["value"][index]["body"]["content"],
                  from: selectedChat.members[0]
                }
              )
            } else {
              //TO DO handle error. How can there be not members of a chat the user is in
            }
          }
        }
      }
      console.log("This", data["@odata.nextLink"])
      if (data["@odata.nextLink"] !== null && data["@odata.nextLink"] !== undefined){
        setNextLink(data["@odata.nextLink"])
        setIsEndOfChat(false)
      } else {
        console.log("HEre")
        setNextLink("")
        setIsEndOfChat(true)
      }
      setSelectedChatMessages([...previousMessages, ...newMessages])
      setCurrentLoadingResultMessages(loadingResult.success)
    } else {
      if (response.status === 401){
        setCurrentLoadingResultMessages(loadingResult.unauthorized)
      } else {
        setCurrentLoadingResultMessages(loadingResult.failure)
      }
    }
  }

  async function getUserId() {
    const response = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/me")
    const data = await response.json()
    console.log(data)
    setUserID(data["id"])
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    console.log("handel")
    const clientHeight = event.nativeEvent.contentSize.height
    const offsetWidth = event.nativeEvent.contentOffset.x
    const offsetHeight = event.nativeEvent.contentOffset.y
    const scrollHeight = event.nativeEvent.layoutMeasurement.height

    const hasOverflowingChildren = offsetHeight < scrollHeight
    const bottom = scrollHeight === clientHeight; // Returns a boolean if the user is at the bottom of the screen
    if (bottom && hasOverflowingChildren) { 
      console.log("Ran1")
      if (nextLink !== ""){
        console.log("Ran2")
        getChatMessages(nextLink, selectedChatMessages)
      }
    }
  }

 async function sendMessage(chatId: string, content: string) {
  const body = {
    "body": {
      "content":content
    }
  }
  const result = callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/chats/" + chatId + "/messages", "POST", JSON.stringify(body))
 }

  async function chatUpdates(chatId: string) {
    const date = Date.now() + 1800000
    //    "encryptionCertificate": "{base64encodedCertificate}",
    //"encryptionCertificateId": "{customId}",
    const userResult = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/me")
    const userData = await userResult.json()
    console.log(userData)
    const encryptID = create_UUID()
    const body = {
      "changeType": "created,updated",
      // "notificationUrl": "https://webhook.azurewebsites.net/api/resourceNotifications",
      "resource": "/chats/"+ chatId +"/messages",
      "includeResourceData": true,
      "encryptionCertificate": publicKey,
      "encryptionCertificateId": encryptID,
      "expirationDateTime": new Date(date).toISOString(),
      "clientState": userData["id"]
    }
    console.log(encryptID)
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/subscriptions", "POST", JSON.stringify(body))
    console.log(result)
    const data = await result.json()
    console.log(data)
  }

  useEffect(() => {
    if (selectedChat !== undefined){
      setIsEndOfChat(false)
      getChatMessages("https://graph.microsoft.com/v1.0/me/chats/" + selectedChat.id + "/messages", [])
      // chatUpdates(selectedChat.id)
    }
  }, [selectedChat])

  useEffect(() => {
    getUserId()
    getChats("https://graph.microsoft.com/v1.0/me/chats?$expand=lastMessagePreview,members")
  }, [])

  return (
    <View>
      <View style={{flexDirection: "row"}}>
        <View style={{borderRightColor: "black", borderRadius: 5, borderRightWidth: 5, height: dimensions.window.height, width: dimensions.window.width * 0.2, overflow: "hidden"}}>
          { chats.map((item: ChatType) => (
            <ChatBlock onSetSelectedChat={setSelectedChat} item={item} width={dimensions.window.width * 0.2} />
          ))
          }
        </View>
        <View style={{height: dimensions.window.height}}>
            <View style={{height: dimensions.window.height * 0.8}}>
              { (currentLoadingResultMessages === loadingResult.loading) ?
                <Text>loading</Text>:
                <ScrollView onScroll={handleScroll}>
                  <View ref={chatDivRef} style={{width: "100%", height: "100%"}}>
                      { selectedChatMessages.reverse().map((item: MessageData) => (
                      <View style={{borderColor: "black", borderRadius: 2, padding: 5, margin: 5, width: dimensions.window.width * 0.75}}>
                          <Text>{item.from.displayName}</Text>
                          {
                              //TO DO deal with installing react-native-webview
                              //    <p>{html}</p> <div dangerouslySetInnerHTML={sanitize(html)} />
                          }
                          <SanatizeHTML html={item.content} />
                      </View>
                      ))
                      }
                      { isEndOfChat ? <Text>End of converstaion</Text>:null}
                  </View>
              </ScrollView>
              }
            </View>
        </View>
      </View>
      <View style={{borderColor: "black", borderWidth: 2, width: dimensions.window.width * 0.7, height: dimensions.window.height * 0.1, position: "absolute", top: dimensions.window.height * 0.9, left: dimensions.window.width * 0.2}}>
        <SendMessageComponent onSend={(item) => {
          if (selectedChat !== undefined) {
            sendMessage(selectedChat.id, item);
          }
        }} width={dimensions.window.width * 0.7} height={dimensions.window.height * 0.1} />
      </View>
    </View>
  )
}

function ChatBlock({onSetSelectedChat, item, width}:{onSetSelectedChat: (item: ChatType) => void, item: ChatType, width: number}) {
  const microsoftAccessToken = useContext(accessTokenContent);
  const [photoUrl, setPhotoUrl] = useState<string>("")
  async function getChatPhoto(chatID: string) {
    const result = await callMsGraph(microsoftAccessToken.accessToken, "https://graph.microsoft.com/v1.0/chats/" + chatID + "/members/photo/$value")
    const dataBlob = await result.blob()
    const url = URL.createObjectURL(dataBlob)
    console.log(url)
    setPhotoUrl(url)
  }
  useEffect(() => {
    getChatPhoto(item.id)
  }, [])
  return (
    <Pressable onPress={() => {onSetSelectedChat(item)}} style={{overflow: "hidden", width: width, height: width * 0.8}}>
      <View style={{flexDirection: "row"}}>
        { (photoUrl !== "") ?
          <Image source={{uri: photoUrl}} width={width * 0.3} height={width * 0.3} style={{width: width * 0.3, height: width * 0.3}}/>:<Text>No Woky</Text>
        }
        <View>
          <Text>{item.lastMessage.from?.displayName}</Text>
          <SanatizeHTML html={item.lastMessage.content} />
        </View>
      </View>
    </Pressable>
  )
}