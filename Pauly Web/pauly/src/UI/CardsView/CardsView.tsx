import React, { useEffect, useState } from 'react'
import { loadFromFirebase } from '../../Functions/CardFirebaseFuncitons'
import { UseAuth } from '../../Contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import VideoContainerCard from '../VideoContainerCard.tsx';
import PDFViewContainer from '../../Components/Government/Cards/PDFView.tsx';
import SVG from '../../Components/Government/Cards/SVG.tsx';
import LexicalRead from '../../Components/Government/Cards/LexicalFunctions/LexicalEditorReadOnly.tsx';
import LexicalEditor from "../../Components/Government/Cards/LexicalFunctions/LexicalEditor.tsx"

export default function CardsView({width, height, selectedPageID}:{width: string, height: string, selectedPageID: number}) {
  const { db } = UseAuth()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedPage, setSelectedPage] = useState<PageType>(null)
  const [selectedDeviceMode, setSelectedDeviceMode] = useState<deviceModeType>(null)
  const [avaliableDeviceModes, setAvaliableDeviceModes] = useState<deviceModeType[]>(null)
  const [components, setComponents] = useState<CardElement[]>(null)

  async function loadFirebase(selectedPageFirebase: PageType){
    var newAvaiableDeviceModes: deviceModeType[] = selectedPageFirebase.deviceModes
    for(var index = 0; index < newAvaiableDeviceModes.length; index++){
      const result = await loadFromFirebase(newAvaiableDeviceModes[index].id, selectedPageFirebase.firebaseID.toString(), db)
      newAvaiableDeviceModes[index].components = result
      if (selectedPageFirebase.defaultDeviceMode !== undefined){
        if (newAvaiableDeviceModes[index].id === selectedPageFirebase.defaultDeviceMode){
          setSelectedDeviceMode(newAvaiableDeviceModes[index])
          setComponents(newAvaiableDeviceModes[index].components)
        }
      } else if (newAvaiableDeviceModes[index].order === 0) {
        setSelectedDeviceMode(newAvaiableDeviceModes[0])
        setComponents(newAvaiableDeviceModes[0].components)
      }
    }
    setAvaliableDeviceModes(newAvaiableDeviceModes)
    setIsLoading(false)
  }

  async function getCardData() {
    const querySnapshot = await getDoc(doc(db, "Pages", selectedPageID.toString()));
    if (querySnapshot.exists){
      const data = querySnapshot.data()
      setSelectedPage(
        {
          bindRef: data["BindRef"],
          firebaseID: data["FirebaseID"],
          use: data["Use"],
          deviceModes: data["DeviceModes"],
          backgroundColor: data["BackgroundColor"]
        }
      )
      loadFirebase(
        {
          bindRef: data["BindRef"],
          firebaseID: data["FirebaseID"],
          use: data["Use"],
          deviceModes: data["DeviceModes"],
          backgroundColor: data["BackgroundColor"]
        }
      )
    } else {
      //TO DO handle error
    }
  }

  useEffect(() => {
    getCardData()
  }, [])

  return (
    <div>
      { isLoading ?
        <div>
          <p>Loading</p>
        </div>:
        <div style={{width: width, height: height, backgroundColor: selectedPage.backgroundColor, margin: 0, overflowX: 'hidden', overflow: "hidden"}}>
          {components?.map((item: CardElement) => ( 
              <div style={{zIndex: item.CurrentZIndex, position: "absolute", transform: `translate(${item.Position.XPosition}px, ${item.Position.YPosition}px)`, height: item.Height + "px", width: item.Width + "px"}}> 
                <div style={{ position: "absolute", height: item.Height + "px", width: item.Width + "px",}}>
                  <div key={item.ElementIndex} style={{ position: "absolute", border: "none", backgroundColor: "transparent", margin:0, padding:0, height: item.Height + "px", width: item.Width + "px"}}>
                      <div style={
                      {
                          opacity: item.Opacity/100
                      }}>
                      {(() => {
                              switch(item.ElementType) {
                              case "Text": return (
                                <div style={{width: item.Width, height: item.Height, overflow: "hidden"}}>
                                  <LexicalRead value={item.Content} onMount={() => {}} width={item.Width} height={item.Height}/>
                                </div>
                              )
                              case "Shape": return <div style={{ borderRadius: item.CornerRadius + "px",  height: item.Height + "px", width: item.Width + "px", backgroundColor: item.SelectedColor.toString(), padding: 0, margin: 0, border: "none"}}> </div>;
                              case "Image": return <div style={{ borderRadius: item.CornerRadius + "px",  height: item.Height + "px", width: item.Width + "px", backgroundColor: "transparent", padding: 0, margin: 0, border: "none"}}><img src={item.Content} style={{height: item.Height + "px", width: item.Width + "px"}} draggable={false}/></div>;
                              case "Video": return (
                                  <div style={{ borderRadius: item.CornerRadius + "px",  height: item.Height + "px", width: item.Width + "px", backgroundColor: "transparent", padding: 0, margin: 0, border: "none"}}>
                                      <VideoContainerCard url={item.Content}/>
                                  </div>)
                              case "PDF": return (
                                  <div style={{overflow: "scroll", width: "100%", height: item.Height + "px"}}>
                                      <PDFViewContainer fileUrl={item.Content} />
                                  </div>
                              )
                              case "SVG": return <SVG read={true} content={item.Content} width={item.Width} height={item.Height} />
                              default: return <p style={{padding: 0, margin: 0}}> {item.Content} </p>
                              }
                          })()}
                      </div>
                  </div>
                </div>
              </div>
          ))}
        </div>
      }
    </div>
  )
}
