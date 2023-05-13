import { useState, useRef, useEffect } from 'react'
import { Link, Navigate } from "react-router-dom"
import { Container, Row, Col, Button, Card, Form, Stack, Dropdown, InputGroup, ListGroup } from 'react-bootstrap';
// import { View } from 'react-native';
import textIcon from "../../../images/textIcon.png"
import imageIcon from "../../../images/imageIcon.png"
import shapesIcon from "../../../images/shapesIcon.png"
import imageOverlay from "../../../images/Iphone14.png"
import * as React from 'react';
import { useCardContext } from "./Cards.js"
import styles from "./Cards.module.css"
import { FaArrowRight, FaArrowLeft } from "react-icons/fa"
import { FcLeft, FcSettings } from "react-icons/fc"
import DropdownMenu from 'react-bootstrap/esm/DropdownMenu';
import { getStorage, ref, uploadBytesResumable, UploadTaskSnapshot, getDownloadURL } from 'firebase/storage';
import { doc, collection, getDoc, getDocs, getFirestore, addDoc, Timestamp, serverTimestamp, FieldValue, updateDoc, where, query, DocumentData, startAt, limit, startAfter } from "firebase/firestore";
import { useAuth } from '../../../Contexts/AuthContext';
import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import PlaygroundNodes from './playgroundNode.ts';
import PlaygroundEditorTheme from './EditorTheme.ts';
import { ContentEditable } from "@lexical/react/LexicalContentEditable";

declare global{
  type CardElement = {
    ElementType: string
    Content: string
    Position: {
      XPosition: number
      YPosition: number
    }
    Width: number
    Height: number
    CurrentZIndex: number
    ElementIndex: number
    Opacity: number
    CornerRadius: number
    SelectedColor: String
    SelectedFont: string
  }
}

type fileType = {
  contributers: string[]
  dateCreated: Date
  description: string
  fileLocation: string
  fileName: string
  fileType: string
  lastModified: Date
  lastUsed: Date
  owners: string[]
  public: boolean
  searchWords: string[]
  uniqueID: string
  viewers: string[]
  fileURL: string | null
  selected: boolean
}

type fileUserType = {
  UsersName: string
  UsersId: string
  Owner: boolean
  Contributer: boolean
  Viewer: boolean
}

enum SelectedImageLibraryModeType {
  Recent,
  Images,
  Gifs,
  Videos,
  PDFS
}

enum SelectedSettingsModeType{
  Gerneral,
  Members,
  Discription
}

enum SelectedAspectType{
  Small,
  Medium,
  Large
}

interface SelectedFont {
  family: string;
  category: string;
}

export default function EditCard() {
  const outerDivRef = useRef(null)
  const { SelectedCard, components, setComponents, zoomScale, setZoomScale } = useCardContext()
  const [isShowingSettings, setIsShowingSettings] = useState(false)
  const [isNavigateToDestinations, setIsNavigateToDestinations] = useState(false)
  const [scrollDir, setScrollDir] = useState("scrolling down");
  const [pressed, setPressed] = React.useState(false)
  const [selectedElementValue, setSelectedElement] = React.useState<CardElement>()
  const [isShowingRightClick, setIsShowingRightClick] = React.useState(false)
  const [MousePosition, setMousePosition] = React.useState({x: 0, y:0})
  const [isChangeingSize, setIsChangingSize] = React.useState(false)
  const [chaningSizeDirection, setChangingSizeDirection] = React.useState<String>(null)
  const [isUserTyping, setIsUserTypeing] = React.useState(false)
  const [SelectedImageLibraryMode, setSelectedImageLibraryMode] = React.useState<SelectedImageLibraryModeType>(SelectedImageLibraryModeType.Images)
  const [areaHeight, setAreaHeight] = useState(85)
  const [areaWidth, setAreaWidth] = useState(80)
  const [aspectHeight, setAspectHeight] = useState(20)
  const [aspectWidth, setAspectWidth] = useState(10)
  const [width, setWidth] = useState(window.innerWidth);//Device Width
  const [height, setHeight] = useState(window.innerHeight);//Device height

  //Pauly Library
  const fileInputRef = useRef(null);
  const [isShowingPaulyLibaray, setIsShowingPaulyLibrary] = useState(false)
  const [isShowingUpload, setIsShowingUpload] = useState(false)
  const [fileUrl, setFileUrl] = useState('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileType, setFileType] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchWords, setSearchWords] = useState<String [] | null>(null)
  const [fileName, setFileName] = useState<string>('');
  const [isPublic, setIsPublic] = useState<Boolean>(false)
  const [owners, setOwners] =  useState<String []>([])
  const [contributers, setContributers] =  useState<String [] >([])
  const [viewers, setViewers] =  useState<String []>([])
  const [description, setDiscriptions] = useState<String>('')
  const [files, setFiles] = useState<fileType[]>([])
  const { app, db, currentUser } = useAuth()
  const videoElement = useRef(null)
  const [fileUsers, setFileUsers] = useState<fileUserType[]>()
  const [collectionPageNumber, setCollectionPageNumber] = useState<number>(1)
  const [selectedFileLibrary, setSelectedFileLibrary] = useState<fileType | null>(null)
  const [selectedFont, setSelectedFont] = useState<string>("Open Sans");

  const storage = getStorage(app);

  const EMPTY_CONTENT =
  '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

  const editorConfig = {
    editorState: EMPTY_CONTENT,
    namespace: 'Playground',
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
  };
  
  useEffect(() => {
    CalculateAreaPlaneSize()
  }, [zoomScale, height, width, selectedElementValue]);

  const updateDimensions = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
  }

  useEffect(() => {
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  function addComponent(e: React.SyntheticEvent, newValue:CardElement) { 
      e.preventDefault()
      setComponents([...components, newValue])
  }
  
  function setZoom(e: React.SyntheticEvent){
    setZoomScale(100)
  }

  useEffect(() => {
    const threshold = 0;
    let lastScrollY = window.pageYOffset;
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset;

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false;
        return;
      }
      setScrollDir(scrollY > lastScrollY ? "scrolling down" : "scrolling up");
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);
    console.log(scrollDir);

    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollDir]);

  function onChangeSetZoomScale(value: string){
    if (value.slice(-1) == "%") {
      setZoomScale(value.slice(0, -1))
    } else {
      if (value.includes('%')) {
        const last = value.slice(-1)
        setZoomScale(value.slice(0, -2) + last)
      } else {
        setZoomScale(value.slice(0, -1))
      }
    }
  }

  // Update the current position if mouse is down
  const onMouseMove = (event: React.MouseEvent) => {
    if (pressed){
      const NewComponents = [...components]
      const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
      if (selectedElementValue != undefined) {
          NewComponents[SelectedIndex]["Position"]["XPosition"] = NewComponents[SelectedIndex]["Position"]["XPosition"] + event.movementX
          NewComponents[SelectedIndex]["Position"]["YPosition"] = NewComponents[SelectedIndex]["Position"]["YPosition"] + event.movementY
          setComponents(NewComponents)
      }
    } else {
      if (isChangeingSize) {
          const NewComponents = [...components]
          const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
          if (selectedElementValue != undefined) {
              if (chaningSizeDirection === "n"){
                  NewComponents[SelectedIndex]["Position"]["YPosition"] = NewComponents[SelectedIndex]["Position"]["YPosition"] + event.movementY
                  NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] - event.movementY
                  setComponents(NewComponents)
              }
              else if (chaningSizeDirection === "s"){
                  NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] + event.movementY
                  setComponents(NewComponents)
              }
              else if (chaningSizeDirection === "e"){
                  NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] + event.movementX
                  setComponents(NewComponents)
              }
              else if (chaningSizeDirection === "w"){
                  NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] - event.movementX
                  NewComponents[SelectedIndex]["Position"]["XPosition"] = NewComponents[SelectedIndex]["Position"]["XPosition"] + event.movementX
                  setComponents(NewComponents)
              }
              else if (chaningSizeDirection === "nw" ){
                  NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] - event.movementY
                  NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] - event.movementY
                  NewComponents[SelectedIndex]["Position"]["XPosition"] = NewComponents[SelectedIndex]["Position"]["XPosition"] + event.movementX
                  NewComponents[SelectedIndex]["Position"]["YPosition"] = NewComponents[SelectedIndex]["Position"]["YPosition"] + event.movementY
                  setComponents(NewComponents)
              }
              else if (chaningSizeDirection === "ne"){
                  NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] - event.movementY
                  NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] - event.movementY
                  NewComponents[SelectedIndex]["Position"]["YPosition"] = NewComponents[SelectedIndex]["Position"]["YPosition"] + event.movementY
                  setComponents(NewComponents)
              }
              else if (chaningSizeDirection === "sw"){
                  NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] + event.movementY
                  NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] + event.movementY
                  NewComponents[SelectedIndex]["Position"]["XPosition"] = NewComponents[SelectedIndex]["Position"]["XPosition"] + event.movementX
                  // NewComponents[SelectedIndex]["Position"]["YPosition"] = NewComponents[SelectedIndex]["Position"]["YPosition"] + event.movementY
                  setComponents(NewComponents)
              }
              else if (chaningSizeDirection === "se"){
                  NewComponents[SelectedIndex]["Height"] = NewComponents[SelectedIndex]["Height"] + event.movementY
                  NewComponents[SelectedIndex]["Width"] = NewComponents[SelectedIndex]["Width"] + event.movementY
                  setComponents(NewComponents)
              }
          }
      }
    }
  }

  async function getUsers(){
    const collectionRef = collection(db, "Users")
    const result = query(collectionRef, limit(150))//TO DO Add Start After
    const querySnapshot = await getDocs(result)
    const documents: fileUserType[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      const NewData: fileUserType = {
        UsersName: data["First Name"] as string + " " + data["Last Name"] as string,
        UsersId: data["uid"] as string,
        Owner: false,
        Contributer: false,
        Viewer: false
      }
      if (NewData.UsersId === currentUser.uid){
        NewData.Owner = true
        NewData.Contributer = true
        NewData.Viewer = true
      }
      documents.push(NewData)
    })
    setFileUsers(documents)
  }

  async function handleDownload(contentFileUrl: string) {
    try {
      const url = await getDownloadURL(ref(storage, contentFileUrl));
      console.log("This is url", url)
      return url
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  async function getUsersFiles(){
    const collectionRef = collection(db, "Files")
    const result = query(collectionRef, where("viewers", "array-contains", currentUser.uid))
    console.log(currentUser.uid)
    const querySnapshot = await getDocs(result);
    const documents: fileType[] = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      const data = doc.data();
      const newData: fileType = {
        contributers: data.contributers as string[],
        dateCreated: data.dateCreated as Date,
        description: data.description as string,
        fileLocation: data.fileLocation as string,
        fileName: data.fileName as string,
        fileType: data.fileType as string,
        lastModified: data.lastModified as Date,
        lastUsed: data.lastUsed as Date,
        owners: data.owners as string[],
        public: data.pubic as boolean,
        searchWords: data.searchWords as string[],
        uniqueID: data.uniqueID as string,
        viewers: data.viewers as string[],
        fileURL: null,
        selected: false
      }
      documents.push(newData);
    })
    setFiles(documents)
    const NewComponents = [...files]
    for (const image of documents) {
      const result = await handleDownload(image.fileLocation)
      console.log("This is image unique", image.uniqueID)
      console.log("This is files", files)
      const SelectedIndex = files.findIndex((element: fileType) => element.uniqueID === image.uniqueID)
      console.log("This is selected index", SelectedIndex)
      console.log("This is newcomponents selected index", NewComponents[SelectedIndex]["fileURL"])
      NewComponents[SelectedIndex]["fileURL"] = result as string
    }
    setFiles(NewComponents)
  }

  useEffect(() => {
    getUsers()
    getUsersFiles()
    setOwners([currentUser.uid])
    setContributers([currentUser.uid])
    setViewers([currentUser.uid])
    CalculateAreaPlaneSize()
  }, [])

  const handleOnClick = (e: React.SyntheticEvent, Index: CardElement) => {
    e.preventDefault();
    if (selectedElementValue?.ElementIndex === Index.ElementIndex){
        
    } else {
      setSelectedElement(Index)
    }
  };

  const handler = (event: React.KeyboardEvent) => {
    if (event.key === 'Backspace' && !isUserTyping) {
        const removeIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
        setSelectedElement(null)
        components.pop(removeIndex - 1)
    }
  };

  if (isNavigateToDestinations === true) {
    return <Navigate to="/government/cards/edit/destinations"/>;
  }


  function CalculateAreaPlaneSize() {
    // if (width >= height){ 
    //   if (aspectWidth >= aspectHeight){ 
    //     //Lower Size: height
    //     //Higher Size: width
    //     //Lower Aspect: height
    //     //Higher Aspect: width
    //     console.log("hwhw")
    //     setAreaHeight(Elementheight*(zoomScale/100))
    //     setAreaWidth(((ElementWidth/aspectHeight) * aspectWidth)*(zoomScale/100))
    //   } else { 
    //     //Lower Size: height
    //     //Higher Size: width
    //     //Lower Aspect: width
    //     //Higher Aspect: height
    //     console.log("hwwh")
    //     setAreaHeight((((Elementheight/aspectHeight) * aspectWidth))*(zoomScale/100))
    //     const NewHeight = ((Elementheight/aspectHeight) * aspectWidth)
    //     setAreaWidth((((NewHeight/aspectWidth) * aspectHeight)*(zoomScale/100)))
    //   }
    // } else {
    //   if (aspectWidth >= aspectHeight){
    //     //Lower Size: width
    //     //Higher Size: height
    //     //Lower Aspect: height
    //     //Higher Aspect: width
    //     console.log("whhw")
    //     setAreaHeight(Elementheight)
    //     setAreaWidth((((ElementWidth/aspectHeight) * aspectWidth)*(zoomScale/100)))
    //   } else {
    //     //Lower Size: width
    //     //Higher Size: height
    //     //Lower Aspect: width
    //     //Higher Aspect: height
    //     console.log("whwh")
    //     setAreaHeight((((Elementheight/aspectHeight) * aspectWidth)*(zoomScale/100)))
    //     const NewHeight = ((Elementheight/aspectHeight) * aspectWidth)
    //     setAreaWidth((((NewHeight/aspectWidth) * aspectHeight) * (zoomScale/100)))
    //   }
    // }
    var elementWidth = width * 0.98
    const elementHeight = height * 0.85
    if (selectedElementValue) {
      elementWidth = width * 0.8
    }
    if (aspectWidth >= aspectHeight){
      const newHeight = (elementWidth/aspectWidth) * aspectHeight
      console.log("new height", newHeight)
      if (newHeight > elementHeight){
        setAreaHeight((elementHeight) * (zoomScale/100))
        setAreaWidth(((elementWidth/aspectWidth) * aspectHeight) * (zoomScale/100))
      } else {
        setAreaHeight(newHeight * (zoomScale/100))
        setAreaWidth(elementWidth * (zoomScale/100))
      }
    } else {
      const newWidth = (elementHeight/aspectHeight) * aspectWidth
      if (newWidth > elementHeight){
        setAreaWidth((elementHeight) * (zoomScale/100))
        setAreaHeight(((elementHeight/aspectHeight) * aspectWidth) * (zoomScale/100))
      } else {
        setAreaWidth(newWidth * (zoomScale/100))
        setAreaHeight(elementHeight * (zoomScale/100))
      }
    }
    console.log("height", areaHeight)
    console.log("width", areaWidth)
    console.log("Window Width 98", (width * 0.98))
    console.log("window Height 85", (height * 0.85))
  }

  async function handleUpload() {
    if (selectedFile) {
      const docRef = await addDoc(collection(db, "Files"), {
        fileLocation: "Library/Error",
        uniqueID: "Error",
        searchWords: searchWords,
        public: isPublic,
        owners: owners,
        contributers: contributers,
        viewers: viewers,
        dateCreated: serverTimestamp(),
        lastModified: serverTimestamp(),
        lastUsed: serverTimestamp(),
        fileName: fileName,
        description: description,
        fileType: fileType
      });
      await updateDoc(docRef, {fileLocation: `Library/${docRef.id}`, uniqueID: docRef.id})
      // Create a storage reference
      const storage = getStorage();

      // Create a storage reference for the selected file
      const storageRef = ref(storage, "Library/" + docRef.id);

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      // Update progress bar
      uploadTask.on('state_changed', (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, (error: Error) => {
        console.error(error);
      }, () => {
        // Upload complete
        console.log('File uploaded successfully');
      });
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFileNew = event.target.files[0];
      if (selectedFileNew) {
        const allowedFileTypes = ['image/gif', 'image/jpeg', 'image/heif', 'image/png', 'image/avif', 'application/pdf', 'image/svg+xml', 'image/webp', 'image/bmp', 'audio/aac', 'video/x-msvideo', 'audio/mpeg', 'video/mp4', 'video/mpeg', 'audio/webm', 'video/webm', 'video/quicktime', 'application/pdf', 'text/csv', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/rtf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.apple.keynote', 'application/vnd.apple.pages', 'application/vnd.apple.numbers']
        const imagesTypes = ['image/jpeg', 'image/png', 'image/avif', 'image/svg+xml', 'image/webp', 'image/bmp', 'image/heif']
        const videoTypes = ['video/x-msvideo', 'video/mp4', 'video/mpeg', 'video/webm', 'video/quicktime']
        const pdfTypes = ['application/pdf', 'text/csv', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/rtf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.apple.keynote', 'application/vnd.apple.pages', 'application/vnd.apple.numbers']
        if (allowedFileTypes.includes(selectedFileNew.type)){
          if (selectedFileNew.type === 'image/gif'){
            const reader = new FileReader();
            reader.onload = (ev) => {
              const blob = new Blob( [ reader.result ] );
              setFileSize(blob.size);
              const url = URL.createObjectURL( blob );
              setFileUrl(url);
              console.log(url)
              setSelectedFile(selectedFileNew);
              setFileType("image/gif");
              setFileName(selectedFileNew.name);
            };
            reader.readAsArrayBuffer(selectedFileNew);
          } else if (imagesTypes.includes(selectedFileNew.type)){
            const reader = new FileReader();
            reader.onload = (ev) => {
              const image = new Image();
              image.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.drawImage(image, 0, 0);
                  const dataUrl = canvas.toDataURL("image/jpeg");
                  setFileSize(canvas.toDataURL().length * 0.75);
                  setFileUrl(dataUrl);
                  const canvasFile = dataURLtoFile(dataUrl, selectedFileNew.name);
                  setSelectedFile(canvasFile);
                }
              };
              image.src = reader.result as string;
              setFileType("image/jpeg");
              setFileName(selectedFileNew.name);
            };
            reader.readAsDataURL(selectedFileNew);
          } else if (videoTypes.includes(selectedFileNew.type)){

          } else if (pdfTypes.includes(selectedFileNew.type)){

          } else {
            //TO DO Handle Error
          }
        } else {
          //TO DO Handel Error
        }
      }
    }
  };

  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
    setIsShowingUpload(true)
  };

  return (
    <>
      <div onClick={() => (setIsShowingRightClick(false))} ref={outerDivRef}>
        <LexicalComposer initialConfig={editorConfig}>
        <div className={styles.EditCardBottemView} style={{overflow:"hidden"}}>
          <Container fluid>
            <Row>
              <Col className={styles.TitleEditCard}>
                <h1 className={styles.TitleEditCard}> Edit Card </h1>
              </Col>
              <Col className='justify-content-right'>
                <Link to="/government/cards" style={{textDecoration: "none"}}>
                  <p className={styles.EditCardBackButton}>
                    Back
                  </p>
                </Link>
              </Col>
            </Row>
            <Row>
              <Col>
                  <Stack>
                    {/* Continer */}
                    <div className={styles.CardContainterCardCSS} style={(zoomScale >= 100) ? selectedElementValue ? {
                          height: "85vh",
                          width: "80vw",
                          position:"relative"
                        }:{
                          height: "85vh",
                          width: "98vw",
                          position:"relative"
                        }: selectedElementValue ? {
                          height: "85vh",
                          width: "80vw"
                        }:{
                          height: "85vh",
                          width: "98vw"
                        }
                      }
                      onKeyDown={handler}
                      onMouseUp={ (e) => {
                        if (e.button == 0){
                            if (pressed){
                              setPressed(false)
                              // setIsShowingRightClick(false)
                            } else {
                                if (isChangeingSize){
                                  setIsChangingSize(false)
                                } else {
                                  setPressed(false)
                                  setSelectedElement(null)
                                }
                            }
                        }
                      }}
                    >
                      
                      <div style={{display: (zoomScale >= 100) ? "block":"flex", justifyContent: "center", alignItems: "center", height: "85vh", width: (zoomScale >= 100) ? "98vw":"85vh"}}>
                        {/* <img src={imageOverlay} style={
                           (zoomScale >= 100) ? 
                           {
                             width: areaWidth * 3 + "px",
                             height: areaHeight + "px",
                             transform: 'scale('+(zoomScale/150)+')',
                             margin: "auto",
                             left: (46 - (0 + (zoomScale/100 * 35))) + "%",
                             zIndex: 2, 
                             position:"absolute"
                           }:{
                             width: areaWidth * 3 + "px",
                             height: areaHeight + "px",
                             left:(46 - (0 + (zoomScale/100 * 35))) + "%",
                             zIndex: 2, 
                             display: "flex",
                             justifyContent: "center",
                             alignItems: "center",
                             margin: "auto",
                             transform: 'scale('+(zoomScale/150)+')',
                             position:"absolute"
                           }}/> */}
                        <div style={ (zoomScale >= 100) ? 
                          {
                            width: areaWidth + "px",
                            height: areaHeight + "px",
                            display: "block",
                            overflow: "scroll",
                            margin: "auto"
                          }:{
                            width: areaWidth + "px",
                            height: areaHeight + "px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            margin: "auto",
                            overflow: "scroll"
                          }}
                          >  
                        {/* Area Plane */}
                        <div 
                          style={{
                            transform: 'scale('+(zoomScale/100)+')',
                            transformOrigin: "top left",
                            backgroundColor: "gray",
                            height: areaHeight + "px",
                            width: areaWidth + "px",
                            border: "2px solid black",
                            display: 'flex'
                          }}
                          onMouseMove={ onMouseMove }
                        >
                          {components?.map((item: CardElement) => ( 
                          <div style={{zIndex: item.CurrentZIndex, cursor: "move", position: "absolute", left: item.Position.XPosition * (zoomScale/100) + "px", top: item.Position.YPosition * (zoomScale/100) + "px", height: (item.Height * (zoomScale/100)) + "px", width: (item.Width * (zoomScale/100)) + "px"}}> 
                              <div style={{transform:  'scale('+(zoomScale/100)+')'}}>
                                  <button key={item.ElementIndex} style={{ border: (selectedElementValue?.ElementIndex === item.ElementIndex) ? "5px solid red":"none", backgroundColor: "transparent", margin:0, padding:0, cursor: (selectedElementValue?.ElementIndex === item.ElementIndex) ? "select":"move", height: (item.Height * (zoomScale/100)) + "px", width: (item.Width * (zoomScale/100)) + "px"}}
                                  onClick={ (e) => {
                                    handleOnClick(e, item)
                                  }}
                                  onMouseDown={(e) => {
                                    if (e.button == 0 && selectedElementValue?.ElementIndex === item.ElementIndex){
                                      setPressed(true)
                                    }
                                  }}
                                  onContextMenu={(e) => {
                                    e.preventDefault()
                                    handleOnClick(e, item)
                                    setMousePosition({x: e.clientX, y: e.clientY})
                                    setIsShowingRightClick(!isShowingRightClick)        
                                  }}>
                                    <div style={
                                      {
                                        opacity: item.Opacity/100
                                      }}>
                                      {(() => {
                                            switch(item.ElementType) {
                                            case "Text": return (
                                              <>
                                              <div onFocus={() => {setIsUserTypeing(true)}} onBlur={() => {setIsUserTypeing(false)}}>
                                                  <RichTextPlugin contentEditable={<ContentEditable className={styles.ContentEditable}/>} placeholder={<p style={{padding: 0, margin: 0}}></p>} ErrorBoundary={LexicalErrorBoundary} />
                                              </div>
                                              {/* <input type="text" id="myInput"  
                                              style={
                                                {
                                                  padding: 0, 
                                                  margin: 0, 
                                                  backgroundColor: "transparent", 
                                                  border:"none", 
                                                  boxShadow: "none",
                                                  outline: "none"
                                                }
                                              } 
                                              className="apply-font"
                                              value={String(item.Content)} 
                                              onChange={(event) => {
                                                const NewComponents = [...components]
                                                const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                                                NewComponents[SelectedIndex]["Content"] = event.target.value
                                                setComponents(NewComponents)
                                              }} ></input>; */}
                                              </>)
                                            case "Shape": return <div style={{ borderRadius: item.CornerRadius + "px",  height: item.Height + "px", width: item.Width + "px", backgroundColor: item.SelectedColor.toString(), padding: 0, margin: 0, border: "none"}}> </div>;
                                            case "Image": return <div style={{ borderRadius: item.CornerRadius + "px",  height: item.Height + "px", width: item.Width + "px", backgroundColor: "transparent", padding: 0, margin: 0, border: "none"}}><img src={item.Content} style={{height: item.Height + "px", width: item.Width + "px"}} draggable={false}/></div>;
                                            default: return <p style={{padding: 0, margin: 0}}> {item.Content} </p>
                                            }
                                        })()}
                                    </div>
                                  </button>
                                  { (selectedElementValue?.ElementIndex !== item.ElementIndex) ? null:
                                  <div>
                                      <button className={styles.dotButtonStyle} style={{transform: `translate(${item.Width + 5}px, -13px)`, cursor:"ne-resize"}}onMouseDown={() => {
                                          if (selectedElementValue?.ElementIndex === item.ElementIndex){
                                              setIsChangingSize(true)
                                              setChangingSizeDirection("ne")
                                          }
                                      }}><span className={styles.dot} /></button> {/* Right Top */}
                                      <button className={styles.dotButtonStyle} style={{transform: `translate(${item.Width + 5}px, ${(item.Height - 24)/2}px)`, cursor:"e-resize"}} onMouseDown={() => {
                                          if (selectedElementValue?.ElementIndex === item.ElementIndex){
                                              setIsChangingSize(true)
                                              setChangingSizeDirection("e")
                                          }
                                      }}><span className={styles.dot} /></button>  {/* Right */} 
                                      <button className={styles.dotButtonStyle} style={{transform: `translate(${item.Width + 5}px, ${item.Height - 8}px)`, cursor:"se-resize"}} onMouseDown={() => {
                                          if (selectedElementValue?.ElementIndex === item.ElementIndex){
                                              setIsChangingSize(true)
                                              setChangingSizeDirection("se")
                                          }
                                      }}><span className={styles.dot} /></button> {/* Right Bottem */}
                                      <button className={styles.dotButtonStyle} style={{transform: `translate(${(item.Width + 5)/2}px, ${(item.Height - 8)}px)`, cursor:"s-resize"}} onMouseDown={() => {
                                          if (selectedElementValue?.ElementIndex === item.ElementIndex){
                                              setIsChangingSize(true)
                                              setChangingSizeDirection("s")
                                          }
                                      }}><span className={styles.dot} /></button> {/* Bottem */}
                                      <button className={styles.dotButtonStyle} style={{transform: `translate(0px, ${item.Height - 9}px)`, cursor:"sw-resize"}} onMouseDown={() => {
                                          if (selectedElementValue?.ElementIndex === item.ElementIndex){
                                              setIsChangingSize(true)
                                              setChangingSizeDirection("sw")
                                          }
                                      }}><span className={styles.dot} /></button> {/* Left Bottem */}
                                      <button className={styles.dotButtonStyle} style={{transform: `translate(0px, ${(item.Height - 24)/2}px)`, cursor:"w-resize"}} onMouseDown={() => {
                                          if (selectedElementValue?.ElementIndex === item.ElementIndex){
                                              setIsChangingSize(true)
                                              setChangingSizeDirection("w")
                                          }
                                      }}><span className={styles.dot} /></button> {/* Left */}
                                      <button className={styles.dotButtonStyle} style={{transform: `translate(0px, -13px)`, cursor:"nw-resize"}} onMouseDown={() => {
                                          if (selectedElementValue?.ElementIndex === item.ElementIndex){
                                              setIsChangingSize(true)
                                              setChangingSizeDirection("nw")
                                          }
                                      }}><span className={styles.dot} /></button> {/* Left Top */}
                                      <button className={styles.dotButtonStyle} style={{transform: `translate(${(item.Width + 5)/2}px, -13px)`, cursor:"n-resize"}} onMouseDown={() => {
                                          if (selectedElementValue?.ElementIndex === item.ElementIndex){
                                              setIsChangingSize(true)
                                              setChangingSizeDirection("n")
                                          }
                                      }}><span className={styles.dot} /></button> {/* Top */}
                                  </div>
                                  }
                              </div>
                          </div> ))}
                        </div>
                        </div>
                      {/* mark */}
                      </div>
                    </div>
                    <div className={styles.CardToolbarDiv}>
                      <Stack direction='horizontal' gap={3}>
                        <div>
                        <InputGroup hasValidation>
                          <InputGroup.Text id="inputGroupPrepend" onClick={setZoom} style={{backgroundColor: "white", padding:0, border: "none"}}><FaArrowLeft /></InputGroup.Text>
                          <Form.Control
                            id="SetZoom"
                            onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } 
                            value={zoomScale + "%"}
                            onChange={(event) => { onChangeSetZoomScale(event.target.value) }}
                            className={styles.sizeForm}
                            style={{color:"blue", border: "none",  borderRadius: 0}}
                          />
                          <InputGroup.Text id="inputGroupAfter" onClick={setZoom} style={{backgroundColor: "white", padding: 0, border: "none"}}><FaArrowRight/></InputGroup.Text>
                          <input type="range" min="10" max="500" value={zoomScale} onChange={changeEvent => setZoomScale(changeEvent.target.value)} className={styles.slider} id="myRange" />
                        </InputGroup>
                        </div>
                        <div style={{height:"2vh", width:"20vw"}}>
                          <Button className={styles.DropdownButtonStyle}>
                              <div style={{height:"2vh"}} onClick={e => addComponent(e,  {ElementType: "Text", Content: "Text", Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: components.length + 1, ElementIndex: components.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans"})}>
                                <img src={textIcon} className={styles.imgContainer }/>
                              </div>
                          </Button>
                        </div>
                        <div style={{height:"2vh", width:"20vw"}}>
                          <Dropdown>
                            <Dropdown.Toggle id="dropdown-custom-components" bsPrefix={styles.DropdownButtonStyle}>
                              <div style={{height:"2vh"}}>
                                <img src={shapesIcon} className={styles.imgContainer }/>
                              </div>
                            </Dropdown.Toggle>
                            <DropdownMenu>
                              <Dropdown.Item eventKey="1" onClick={e => addComponent(e,  {ElementType: "Shape", Content: "Text", Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: components.length + 1, ElementIndex: components.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans"})}>Square</Dropdown.Item>
                              <Dropdown.Item eventKey="2">Dots</Dropdown.Item>
                              <Dropdown.Item eventKey="3">Draw</Dropdown.Item>
                              <Dropdown.Item eventKey="4">Shapes Library</Dropdown.Item>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                        <div style={{height:"2vh", width:"20vw"}}>
                          <Button onClick={() => {setIsShowingPaulyLibrary(!isShowingPaulyLibaray)}} className={styles.DropdownButtonStyle}>
                            <div style={{height:"2vh"}}>
                                <img src={imageIcon} className={styles.imgContainer }/>
                              </div>
                          </Button>
                        </div>
                        <Button onClick={() => setIsShowingSettings(!isShowingSettings)} className={styles.DropdownButtonStyle}>
                          <FcSettings />
                        </Button>
                      </Stack>
                    </div>
                  </Stack>
              </Col>
              { selectedElementValue ? 
                <Col xs={2}>
                  <Container>
                    <Row>
                      <Button onClick={() => setIsNavigateToDestinations(true)}>
                        Destination
                      </Button>
                    </Row>
                    { (selectedElementValue.ElementType === "Shape") ? 
                      <>
                        <Row>
                          <p>Corner Radius: {selectedElementValue.CornerRadius}%</p>
                          <input type="range" min="1" max="50" value={selectedElementValue.CornerRadius} 
                          onChange={changeEvent => {
                            const NewComponents = [...components]
                            const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                            NewComponents[SelectedIndex]["CornerRadius"] = changeEvent.target.value
                            setComponents(NewComponents)
                            setSelectedElement(NewComponents[SelectedIndex])
                            
                          }} 
                          className={styles.slider} id="myRange" />
                       </Row>
                        <Row>
                        <input type="color" id="colorpicker" value={selectedElementValue.SelectedColor.toString()} onChange={changeEvent => {
                        const NewComponents = [...components]
                        const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                        NewComponents[SelectedIndex]["SelectedColor"] = changeEvent.target.value
                        setComponents(NewComponents)
                        setSelectedElement(NewComponents[SelectedIndex])
                        }} />
                        </Row>
                      </>:null
                    }
                    { (selectedElementValue.ElementType === "Text") ?
                      <>
                        <Row>
                          {/* <Editor editorState={this.state.editorState} onChange={this.onChange} /> */}
                        </Row>
                      </>:null
                    }
                    <Row>
                      <p>Opacity: {selectedElementValue.Opacity}%</p>
                      <input type="range" min="1" max="100" value={selectedElementValue.Opacity} 
                      onChange={changeEvent => {
                        const NewComponents = [...components]
                        const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                        NewComponents[SelectedIndex]["Opacity"] = changeEvent.target.value
                        setComponents(NewComponents)
                        setSelectedElement(NewComponents[SelectedIndex])
                        
                      }} 
                      className={styles.slider} id="myRange" />
                    </Row>
                    <Row>
                    </Row>
                    <Row>
                      <p>Undo</p>
                    </Row>
                  </Container>
                </Col>:null
              }
            </Row>
          </Container>
        </div>
        </LexicalComposer>
        {
          //Settings menu
          isShowingSettings ?
          <>
            <Card style={{backgroundColor: "white"}}>
              <Card.Body>
                <div className={styles.EditCardTopView}>
                  <Stack direction='horizontal'>
                    <Stack>
                      <p> Edit Use </p>
                      <p> Current Use: {SelectedCard.Use}</p>
                      <Form.Label htmlFor="overlayUse">Use</Form.Label>
                      <Form.Control id="overlayUse"/>
                    </Stack>
                    <Stack>
                      <ListGroup style={{ width: "25vw", zIndex: 100}}>
                        <ListGroup.Item>Use</ListGroup.Item>
                        <ListGroup.Item>Members</ListGroup.Item>
                        <ListGroup.Item>General</ListGroup.Item>
                        </ListGroup>
                    </Stack>
                  </Stack>
                </div>
              </Card.Body>
            </Card>
          </> 
          : null
          //Pauly Library
        }
        {
          isShowingPaulyLibaray ?
          <>
            <input type="file" accept="'image/gif', 'image/jpeg', 'image/png', 'image/avif', 'application/pdf', 'image/svg+xml', 'image/webp', 'image/bmp', 'audio/aac', 'video/x-msvideo', 'audio/mpeg', 'video/mp4', 'video/mpeg', 'audio/webm', 'video/webm', 	'video/quicktime', 'application/pdf', 'text/csv', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/rtf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.apple.keynote', 'application/vnd.apple.pages', 'application/vnd.apple.numbers'" onChange={handleFileChange} style={{display: "none"}} ref={fileInputRef}/>
            {
              isShowingUpload ?
              <div className={styles.ImageLibraryView}>
                <Card>
                  <Card.Text>
                    <Stack direction='horizontal'>
                      <h1 style={{textAlign: "left"}} className={styles.ImageLibraryViewTitle}>Upload File</h1>
                      <Button variant="primary" style={{textAlign: "right"}} onClick={() => {setIsShowingUpload(false)}}>Back</Button>
                    </Stack>
                  </Card.Text>
                  <Card.Body>
                    <Stack direction='horizontal'>
                      <Card>
                        {fileUrl &&  (selectedFile.type === "image/jpeg") && <img src={fileUrl} alt="User-selected image" style={{height: "100px", width: "100px" }} />}
                        {fileUrl && (selectedFile.type === "video/mp4") &&(
                          <video controls  ref={videoElement}>
                            <source src={fileUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                         {fileUrl &&  (selectedFile.type === "image/gif") && <img src={fileUrl} alt="User-selected image" style={{height: "100px", width: "100px" }} />}
                      </Card>
                      <Stack>
                        {fileSize > 0 && <p>Selected file size: {fileSize} bytes</p>}
                        {fileType && <p>Selected file type: {fileType}</p>}
                        {fileName && <p>Selected file name: {fileName}</p>}
                      </Stack>
                      <Stack>
                        <Stack direction='horizontal'>
                          <p>Members</p>
                          <p>Owners</p>
                          <p>Contributes</p>
                          <p>Viewers</p>
                        </Stack>
                        <div>
                          {fileUsers?.map((item: fileUserType) => (
                            <Stack direction='horizontal'>
                              <p> {item.UsersName} </p>
                              <input
                                type="checkbox"
                                checked={item.Owner}
                                onChange={() => {
                                  const NewComponents = [...fileUsers]
                                  const SelectedIndex = fileUsers.findIndex((element: fileUserType) => element.UsersId === item.UsersId)
                                  if (NewComponents[SelectedIndex]["Owner"]){
                                    const NewContributers = contributers.filter(number => number !== item.UsersId);
                                    setContributers(NewContributers)
                                  } else {
                                    const NewContributers = contributers
                                    contributers.push(item.UsersId)
                                    setContributers(NewContributers)
                                  }
                                  NewComponents[SelectedIndex]["Owner"] = !NewComponents[SelectedIndex]["Owner"]
                                  setFileUsers(NewComponents)
                                  
                                }}
                              />
                              <input
                                type="checkbox"
                                checked={item.Contributer}
                                onChange={() => {
                                  const NewComponents = [...fileUsers]
                                  const SelectedIndex = fileUsers.findIndex((element: fileUserType) => element.UsersId === item.UsersId)
                                  if (NewComponents[SelectedIndex]["Contributer"]){
                                    const NewContributers = contributers.filter(number => number !== item.UsersId);
                                    setContributers(NewContributers)
                                  } else {
                                    const NewContributers = contributers
                                    contributers.push(item.UsersId)
                                    setContributers(NewContributers)
                                  }
                                  NewComponents[SelectedIndex]["Contributer"] = !NewComponents[SelectedIndex]["Contributer"]
                                  setFileUsers(NewComponents)
                                  
                                }}
                              />
                              <input
                                type="checkbox"
                                checked={item.Viewer}
                                onChange={() => {
                                  const NewComponents = [...fileUsers]
                                  const SelectedIndex = fileUsers.findIndex((element: fileUserType) => element.UsersId === item.UsersId)
                                  if (NewComponents[SelectedIndex]["Viewer"]){
                                    const NewContributers = contributers.filter(number => number !== item.UsersId);
                                    setContributers(NewContributers)
                                  } else {
                                    const NewContributers = contributers
                                    contributers.push(item.UsersId)
                                    setContributers(NewContributers)
                                  }
                                  NewComponents[SelectedIndex]["Viewer"] = !NewComponents[SelectedIndex]["Viewer"]
                                  setFileUsers(NewComponents)
                                  
                                }}
                              />
                            </Stack>
                          ))}
                        </div>
                      </Stack>
                    </Stack>
                    <Stack direction='horizontal'>
                      <Button onClick={handleUpload}>
                        Upload
                      </Button>
                      {uploadProgress > 0 && <p>Upload Progress: {uploadProgress}%</p>}
                    </Stack>
                  </Card.Body>
                </Card>
              </div>:
              <div className={styles.ImageLibraryView}>
                <Card>
                  <Card.Title>
                    <Stack direction='horizontal'>
                      <h1 style={{textAlign: "left"}} className={styles.ImageLibraryViewTitle}>Library</h1>
                      <Button variant="primary" style={{textAlign: "right"}} onClick={() => {setIsShowingPaulyLibrary(false)}}>Close</Button>
                    </Stack>
                  </Card.Title>
                  <Card.Body>
                    <Card>
                      <Stack direction='horizontal'>
                        <Button onClick={() => {setSelectedImageLibraryMode(SelectedImageLibraryModeType.Images)}}>
                          Images
                        </Button>
                        <Button onClick={() => {setSelectedImageLibraryMode(SelectedImageLibraryModeType.Gifs)}}>
                          Gifs
                        </Button>
                        <Button onClick={() => {setSelectedImageLibraryMode(SelectedImageLibraryModeType.Videos)}}>
                          Vidoes
                        </Button>
                        <Button onClick={() => {setSelectedImageLibraryMode(SelectedImageLibraryModeType.PDFS)}}>
                          PDFs
                        </Button>
                      </Stack>
                        {(SelectedImageLibraryMode === SelectedImageLibraryModeType.Images) ? 
                        <> 
                          {files.map((file) => (
                            <div key={file.uniqueID}>
                              { (file.fileType === "image/jpeg") ? 
                                <button onClick={() => {
                                  const NewComponents = [...files]
                                  const SelectedIndex = files.findIndex((element: fileType) => element.uniqueID === file.uniqueID)
                                  NewComponents[SelectedIndex]["selected"] = !NewComponents[SelectedIndex]["selected"]
                                  setFiles(NewComponents)
                                  if (NewComponents[SelectedIndex]["selected"]){
                                    
                                    setSelectedFileLibrary(null)
                                  } else {
                                    setSelectedFileLibrary(NewComponents[SelectedIndex])
                                  }
                                }}
                                style={{
                                  border: "none",
                                  background: "transparent"
                                }}
                                >
                                  <div>
                                    <img src={file.fileURL} alt='Oh No' style={ file.selected ?
                                      {
                                        width: "20%", height: "20%"
                                      }:
                                      {
                                        width: "20%", height: "20%",
                                        border: "5px solid red"
                                      }
                                    }/>
                                  </div>
                                </button>
                                :null
                              }
                            </div>
                          ))
                          }
                        </>:null}
                        {(SelectedImageLibraryMode === SelectedImageLibraryModeType.Gifs) ? 
                        <> 
                          { (files.length <= 1) ?
                            <p onClick={() => {console.log(files.length)}}>No Files</p>:
                            <>
                              {files.map((file) => (
                                <div key={file.uniqueID}>
                                  { (file.fileType === "image/gif") ? 
                                    <button onClick={() => {
                                      const NewComponents = [...files]
                                      const SelectedIndex = files.findIndex((element: fileType) => element.uniqueID === file.uniqueID)
                                      NewComponents[SelectedIndex]["selected"] = !NewComponents[SelectedIndex]["selected"]
                                      setFiles(NewComponents)
                                      if (NewComponents[SelectedIndex]["selected"]){
                                        setSelectedFileLibrary(null)
                                      } else {
                                        setSelectedFileLibrary(NewComponents[SelectedIndex])
                                      }
                                    }}
                                    style={{
                                      border: "none",
                                      background: "transparent"
                                    }}
                                    >
                                      <div>
                                        {(file.fileURL != null) ?
                                          null:<img src={file.fileURL} alt='Oh No' style={ file.selected ?
                                            {}:
                                            {
                                              border: "5px solid red"
                                            }
                                          }/>
                                        }
                                      </div>
                                    </button>
                                    :null
                                  }
                                </div>
                              ))
                              }
                            </>
                          }
                        </>:null}
                        {(SelectedImageLibraryMode === SelectedImageLibraryModeType.Videos) ? 
                        <> 
                          <p> This is videos </p>
                        </>:null}
                        {(SelectedImageLibraryMode === SelectedImageLibraryModeType.PDFS) ? 
                        <> 
                          <p> This is pdfs </p>
                        </>:null}
                      <Stack direction='horizontal'>
                        <Button onClick={(e) => {
                          addComponent(e,  {ElementType: "Image", Content: selectedFileLibrary.fileURL, Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: components.length + 1, ElementIndex: components.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans"})
                        }} disabled={selectedFileLibrary === null}>
                          <p>Select</p>
                        </Button>
                        <Button>
                          <p>Edit</p>
                        </Button>
                        <Dropdown>
                          <Dropdown.Toggle id="dropdown-custom-components" bsPrefix={styles.DropdownButtonStyle}>
                            <div style={{height:"2vh"}}>
                              <p>Upload</p>
                            </div>
                          </Dropdown.Toggle>
                          <DropdownMenu>
                            <Dropdown.Item eventKey="1" onClick={e => addComponent(e,  {ElementType: "Shape", Content: "Text", Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: components.length + 1, ElementIndex: components.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans"})}>Choose From One Drive</Dropdown.Item>
                            <Dropdown.Item eventKey="2" onClick={handleFileButtonClick}>Upload File</Dropdown.Item>
                          </DropdownMenu>
                        </Dropdown>
                      </Stack>
                    </Card>
                </Card.Body>
              </Card>
            </div>
            }
          </> 
          :null
        }
      </div>
        {isShowingRightClick ? 
          <div>
            <Stack direction='horizontal'>
              <ListGroup style={{position: "absolute", left: MousePosition.x, top: MousePosition.y, width: "25vw", zIndex: 100}}>
                  <ListGroup.Item onClick={() => {
                      const NewComponents = [...components]
                      const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                      NewComponents[SelectedIndex]["CurrentZIndex"] = NewComponents[SelectedIndex]["CurrentZIndex"] + 1
                      setComponents(NewComponents)
                  }}>Move Forward</ListGroup.Item>
                  <ListGroup.Item onClick={() => {
                    const NewComponents = [...components]
                    const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                    NewComponents[SelectedIndex]["CurrentZIndex"] = NewComponents[SelectedIndex]["CurrentZIndex"] - 1
                    setComponents(NewComponents)
                  }}>Move Backward</ListGroup.Item>
                  <ListGroup.Item onClick={() => {
                    const maxValueOfY = Math.max(...components.map((o: CardElement) => o.CurrentZIndex), 0);
                    const NewComponents = [...components]
                    const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                    NewComponents[SelectedIndex]["CurrentZIndex"] = maxValueOfY + 1
                    setComponents(NewComponents)
                  }}>Send To Front</ListGroup.Item>
                  <ListGroup.Item onClick={() => {
                    const maxValueOfY = Math.min(...components.map((o: CardElement) => o.CurrentZIndex), 0);
                    const NewComponents = [...components]
                    const SelectedIndex = components.findIndex((element: CardElement) => element.ElementIndex === selectedElementValue?.ElementIndex)
                    NewComponents[SelectedIndex]["CurrentZIndex"] = maxValueOfY + 1
                    setComponents(NewComponents)
                  }} style={{cursor: "default"}}>Send To Back</ListGroup.Item>
                  <ListGroup.Item>Duplicate</ListGroup.Item>
              </ListGroup>
            </Stack>
          </div>
        :null}
    </>
    
  )
}
