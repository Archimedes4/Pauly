import { useState, useRef, useEffect } from 'react'
import { Link, Navigate } from "react-router-dom"
import { Container, Row, Col, Button, Card, Form, Stack, Dropdown, InputGroup, ListGroup } from 'react-bootstrap';
// import { View } from 'react-native';
import textIcon from "../../../images/textIcon.png"
import imageIcon from "../../../images/imageIcon.png"
import shapesIcon from "../../../images/shapesIcon.png"
import imageOverlay from "../../../images/Iphone14.png"
import Book from "../../../images/Books.png"
import * as React from 'react';
import { useCardContext } from "./Cards.js"
import styles from "./Cards.module.css"
import { FaArrowRight, FaArrowLeft, FaBold, FaItalic, FaUnderline, FaStrikethrough } from "react-icons/fa"
import { FcLeft, FcSettings, FcIphone } from "react-icons/fc"
import {RiComputerFill} from "react-icons/ri"
import {BsTabletLandscape} from "react-icons/bs"
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
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import EditorToolbar from './EditorToolbar.tsx';
import SplashCheckmark from '../../../UI/SplashCheckmark/SplashCheckmark.tsx';
import VideoContainer from '../../../UI/VideoContainer.tsx';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  FOCUS_COMMAND,
  COMMAND_PRIORITY_LOW
} from 'lexical';
import { TextFocusPlugin } from './TextFocusPlugin.tsx';
import { MaxLengthPlugin } from './MaxLengthPlugin.tsx';
import Bold from './LexicalFunctions/Bold.tsx';
import FontSize from './LexicalFunctions/FontSize.tsx';
import FontStyle from './LexicalFunctions/FontStyle.tsx';
import Italic from './LexicalFunctions/Italic.tsx';
import Strikethrough from './LexicalFunctions/Strikethrough.tsx';
import Underlined from './LexicalFunctions/Underline.tsx';

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
  type UserType = {
    FirstName: string
    LastName: string
    Permissions: number[]
    ClassMode: number | null
    ClassPerms: string[] | null
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
  fileURL: null | string
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

enum SelectedCardBindModeType{
  Class,
  Sport,
  Commission
}

interface SelectedFont {
  family: string;
  category: string;
}

type FontType = {
  fontName: string
  fontVarients: string[]
  fontSubsets: string[]
  UUID: string
}
type FontTypeCSS = {
  UUID: string
}

enum MicrosoftUploadModeType {
  ShareLink,
  Personal,
  Site
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
  const [selectedDeviceMode, setSelectedDeviceMode] = useState<SelectedAspectType>(SelectedAspectType.Small)
  const [selectedSettingsMode, setSelectedSettingsMode] = useState<SelectedSettingsModeType>(SelectedSettingsModeType.Discription)
  const [bolded, setBolded] = useState<boolean>(false)
  const [underlined, setUnderlined] = useState<boolean>(false)
  const [italic, setItalic] = useState<boolean>(false)
  const [strikethrough, setStrikethrough] = useState<boolean>(false)
  const [fontSize, setFontSize] = useState<string>("12px")
  const [fontStyle, setFontStyle] = useState<string>("Times New Roman")
  const [fontList, setFontList] = useState<FontType []>([])
  const [selectedFont, setSelectedFont] = useState<FontType>(null)
  const avaliableFontSizes: string[] = ["8px", "12px", "14px", "16px", "20px", "24px"]
  const [isShowingBindPage, setIsShowingBindPage] = useState<boolean>(false)
  const [currentUserInfo, setCurrentUserInfo] = useState<UserType>(null)
  const [showingFontSelectedMenu, setShowingFontSelectionMenu] = useState<boolean>(false)

  //Pauly Library
  const fileInputRef = useRef(null);
  const [isShowingPaulyLibaray, setIsShowingPaulyLibrary] = useState(false)
  const [isShowingUpload, setIsShowingUpload] = useState(false)
  const [isShowingMicrosoftUpload, setIsShowingMicrosoftUpload] = useState(false)
  const [selectedMicrosoftUploadMode, setSelectedMicrosoftUploadMode] = useState<MicrosoftUploadModeType>(MicrosoftUploadModeType.Personal)
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

  //Bind Menu
  const [selectedCardBindMode, setSelectedCardBindMode] = useState<SelectedCardBindModeType>(SelectedCardBindModeType.Class)

  const storage = getStorage(app);

  const EMPTY_CONTENT = '{"root":{"children":[{"children":[{"type":"overflow", "size":10}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

  useEffect(() => {
    fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyB-YMRvC6BSysmmxt5ZQGIZ06izNO20lU8')
      .then(response => response.json())
      .then((data) => {
        var NewArray = []
        for(var index = 0; index < data["items"].length; index++){
          NewArray.push({ fontName:  data["items"][index]["family"], fontVarients: data["items"][index]["variants"], fontSubsets: data["items"][index]["subsets"], UUID: create_UUID()})
        }
        setFontList(NewArray)
      })
  }, [])

  useEffect(() => {
    if (selectedFont !== null) {
      var apiUrl = [];
      apiUrl.push('https://fonts.googleapis.com/css?family=');
      apiUrl.push(selectedFont.fontName.replace(/ /g, '+'));
      if (selectedFont.fontVarients.includes('italic')) {
        apiUrl.push(':');
        apiUrl.push('italic');
      }
      if (selectedFont.fontVarients.includes('bold')) {
        apiUrl.push(':');
        apiUrl.push('bold');
      }
      if (selectedFont.fontSubsets.includes("greek")) {
        apiUrl.push('&subset=');
        apiUrl.push('greek');
      }
  
      // url: 'https://fonts.googleapis.com/css?family=Anonymous+Pro:italic&subset=greek'
      var url = apiUrl.join('');
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = url;
      document.head.appendChild(linkElement);
      setFontStyle(selectedFont.fontName)
    }
  }, [selectedFont])

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
    const NewComponents = [...documents]
    for (const image of documents) {
      const result = await handleDownload(image.fileLocation)
      const SelectedIndex = documents.findIndex((element: fileType) => element.uniqueID === image.uniqueID)
      if (SelectedIndex != -1){
        NewComponents[SelectedIndex]["fileURL"] = result as string
      }
    }
    setFiles(NewComponents)
  }

  useEffect(() => {
    getUserData()
    getUsers()
    getUsersFiles()
    setOwners([currentUser.uid])
    setContributers([currentUser.uid])
    setViewers([currentUser.uid])
    CalculateAreaPlaneSize()
  }, [])

  const arrayChunk = (arr: fileType[], n: number, modeIn: SelectedImageLibraryModeType) => {
    var mode = ""
    if (modeIn === SelectedImageLibraryModeType.Images) {
      mode = "image/jpeg"
    }
    else if (modeIn === SelectedImageLibraryModeType.Gifs) {
      mode = "image/gif"
    }
    else if (modeIn === SelectedImageLibraryModeType.Videos) {
      mode = "video/mp4"
    }
    else if (modeIn === SelectedImageLibraryModeType.PDFS) {
      mode = "application/pdf"
    }
    var NewArray = []
    for (var index = 0; (arr.length - 1) >= index; index++) {
      if (arr[index].fileType === mode){
        NewArray.push(arr[index])
      }
    }
    const array = NewArray.slice();
    const chunks = [];
    while (array.length) chunks.push(array.splice(0, n));
    return chunks;
  };

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
    var elementWidth = width * 0.8
    const elementHeight = height * 0.85
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
            const reader = new FileReader();
            reader.onload = (ev) => {
              const blob = new Blob( [ reader.result ] );
              setFileSize(blob.size);
              const url = URL.createObjectURL( blob );
              setFileUrl(url);
              console.log(url)
              setSelectedFile(selectedFileNew);
              setFileType("video/mp4");
              setFileName(selectedFileNew.name);
            };
            reader.readAsArrayBuffer(selectedFileNew);
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

  function handleMicrosoftButtonClick() {
    setIsShowingUpload(true)
    setIsShowingMicrosoftUpload(true)
  }

  function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
  }

  async function getUserData(){
    const docRef = doc(db, "Users", currentUser.uid)
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data()
      setCurrentUserInfo({FirstName: data["First Name"], LastName: data["Last Name"], Permissions: data["Permissions"], ClassMode: data["ClassMode"], ClassPerms: data["ClassPerms"]})
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  

  return (
    <>
      <div onClick={() => (setIsShowingRightClick(false))} ref={outerDivRef}>
        <div className={styles.EditCardBottemView} style={{overflow:"hidden"}}>
          <Container fluid style={{height: "100%", width: "100%", padding: 0, margin: 0}}>
              <Row>
                 <Col>
                    <div className={styles.editCardBackButtonOuterContainer}>
                      <Link to="/government/cards" style={{textDecoration: "none"}}>
                        <div className={styles.editCardBackButtonInnerContainer}>
                          <p className={styles.EditCardBackButton}>Back</p>
                        </div>
                      </Link>
                    </div>
                  </Col>
                  <Col xs={10} className='ml-5'>
                    <h1 className={styles.TitleEditCard}> Edit Card </h1>
                  </Col>
                  <Col>
                    <div className={styles.editCardBackButtonOuterContainer}>
                      <Button onClick={() => setIsShowingSettings(!isShowingSettings)} className={styles.SettingsButtonStyle}>
                        <FcSettings />
                      </Button>
                    </div>
                  </Col>
              </Row>
              <Row noGutters={true}>
                <Col md={2} style={{margin: 0, padding: 0, paddingLeft: "0.8%"}} className="d-none d-md-block">
                  { selectedElementValue ? 
                    <Container style={{margin: 0, padding: 0, height: "100%", backgroundColor: '#444444', width: "100%"}}>
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
                            {/* <EditorToolbar /> */}
                            <Stack direction='horizontal' style={{paddingTop: "2%", paddingBottom: "2%"}}>
                              <button onClick={(e) => {
                                e.preventDefault()
                                setBolded(!bolded)
                              }} className={bolded ? (styles.TextSelectionButtonSelected):(styles.TextSelectButton)}>
                                <FaBold />
                              </button>
                              <button onClick={(e) => {
                                e.preventDefault()
                                setItalic(!italic)
                              }} className={italic ? (styles.TextSelectionButtonSelected):(styles.TextSelectButton)}>
                                <FaItalic />
                              </button>
                              <button onClick={(e) => {
                                e.preventDefault()
                                setUnderlined(!underlined)
                              }} className={underlined ? (styles.TextSelectionButtonSelected):(styles.TextSelectButton)}>
                                <FaUnderline />
                              </button>
                              <button onClick={(e) => {
                                e.preventDefault()
                                setStrikethrough(!strikethrough)
                              }} className={strikethrough ? (styles.TextSelectionButtonSelected):(styles.TextSelectButton)}>
                                <FaStrikethrough />
                              </button>
                            </Stack>
                            <button onClick={() => {
                              setShowingFontSelectionMenu(!showingFontSelectedMenu)
                            }}>
                              Font: {fontStyle}
                            </button>
                            { showingFontSelectedMenu ? 
                              <div style={{display: "hidden"}}>
                                <div className={styles.FontSelectionDivContainer}>
                                  {fontList.map((font: FontType) => (
                                    <button className={styles.FontSelectionButton} onClick={() => {setSelectedFont(font)}}>{font.fontName}</button>
                                  ))}
                                </div>
                              </div>:null
                            }
                            <Dropdown>
                              <Dropdown.Toggle id="dropdown-custom-components" bsPrefix={styles.DropdownButtonStyle}>
                                <div style={{height:"2vh"}}>
                                  <p> Font Size: {fontSize} </p>
                                </div>
                              </Dropdown.Toggle>
                              <DropdownMenu>
                                { avaliableFontSizes.map((size: string) => (
                                  <Dropdown.Item onClick={e => {
                                    e.preventDefault()
                                    setFontSize(size)
                                  }}>{size}</Dropdown.Item>
                                ))}
                              </DropdownMenu>
                            </Dropdown>
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
                        <p>Undo</p>
                      </Row>
                    </Container>: 
                    <Container style={{backgroundColor: '#444444', height: "100%", width: "100%", margin: 0, padding: 0}}>
                        <div style={{display: "flex", justifyContent: "center"}}>
                          <p style={{fontSize: "12px", padding: 0, margin: 0, marginTop: "5%"}}>Connect Your Page</p>
                        </div>
                        <div style={{display: "flex", justifyContent: "center"}}>
                          <img src={Book} alt='Book' style={{width: "80%"}}/>
                        </div>
                        <div  style={{display: "flex", justifyContent: "center"}}>
                          <button onClick={() => {setIsShowingBindPage(!isShowingBindPage)}} className={styles.BindingButton}>
                            Bind
                          </button>
                        </div>
                    </Container>
                  }
                </Col>
                {/* <Col style={{backgroundColor: "#793033",padding: 0, margin: 0, height: "100%"}}>
                    <div style={{height: "100%"}}> */}
                <Col className={styles.CardContainterCardCSSColumn} style={{width: "100%"}}>
                  {/* Continer */}
                    <div className={styles.CardContainterCardCSS}
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
                      <div style={{display: (zoomScale >= 100) ? "block":"flex", justifyContent: "center", alignItems: "center"}}>
                          <div style={ (zoomScale >= 100) ? 
                            {
                              width: areaWidth + "px",
                              height: areaHeight + "px",
                              display: "block",
                              overflow: "scroll",
                              margin: "auto",
                              padding: 0,
                              transform: "scale(" + (zoomScale/100) +")",
                              transformOrigin: "-" + (zoomScale/100) + "px" + " "+ "0" +"px"
                            }:{
                              width: areaWidth + "px",
                              height: areaHeight + "px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              margin: "auto",
                              padding: 0,
                              overflow: "scroll",
                              transform: "scale(" + (zoomScale/100) +")",
                            }}
                          >  
                          {/* Area Plane */}
                            <div 
                              style={{
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
                          <div style={{zIndex: item.CurrentZIndex, position: "absolute", cursor: "move", transform: `translate(${(item.Position.XPosition * (zoomScale/100))}px, ${(item.Position.YPosition * (zoomScale/100))}px)`, height: (item.Height  * (zoomScale/100)) + "px", width: (item.Width  * (zoomScale/100)) + "px"}}> 
                            <div style={{ position: "absolute",
                                  height: (item.Height  * (zoomScale/100)) + "px",
                                  width: (item.Width  * (zoomScale/100)) + "px",}}>
                            <button key={item.ElementIndex} style={{ position: "absolute", border: (selectedElementValue?.ElementIndex === item.ElementIndex) ? "5px solid red":"none", backgroundColor: "transparent", margin:0, padding:0, cursor: (selectedElementValue?.ElementIndex === item.ElementIndex) ? "select":"move", height: ((item.Height  * (zoomScale/100)) + 10) + "px", width: ((item.Width  * (zoomScale/100)) + 10) + "px"}}
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
                                          <LexicalComposer initialConfig={editorConfig}>
                                            <div onClick={() => {
                                              setIsUserTypeing(!isUserTyping)
                                            }} style={{height: (item.Height * (zoomScale/100)) + "px", width: (item.Width * (zoomScale/100)) + "px", overflow: "hidden"}} >
                                              <MaxLengthPlugin maxLength={300}/>
                                              <RichTextPlugin contentEditable={<ContentEditable className={styles.ContentEditable}/>} placeholder={<p style={{padding: 0, margin: 0}}>Double Click To Add Text</p>} ErrorBoundary={LexicalErrorBoundary} />
                                              <TextFocusPlugin isSelected={(isUserTyping === true && selectedElementValue?.ElementIndex === item.ElementIndex)}/>
                                              { (selectedElementValue?.ElementIndex === item.ElementIndex) ? 
                                                <>
                                                  <Bold bolded={bolded}/>
                                                  <Italic italic={italic}/>
                                                  <Strikethrough strikethrough={strikethrough}/>
                                                  <Underlined underlined={underlined}/>
                                                  <FontSize fontSize={fontSize} />
                                                  <FontStyle fontStyle={fontStyle}/>
                                                </>:null
                                              }
                                            </div>
                                          </LexicalComposer>
                                        </>)
                                      case "Shape": return <div style={{ borderRadius: item.CornerRadius + "px",  height: (item.Height  * (zoomScale/100)) + "px", width: (item.Width  * (zoomScale/100)) + "px", backgroundColor: item.SelectedColor.toString(), padding: 0, margin: 0, border: "none"}}> </div>;
                                      case "Image": return <div style={{ borderRadius: item.CornerRadius + "px",  height: (item.Height * (zoomScale/100)) + "px", width: (item.Width  * (zoomScale/100)) + "px", backgroundColor: "transparent", padding: 0, margin: 0, border: "none"}}><img src={item.Content} style={{height: item.Height + "px", width: item.Width + "px"}} draggable={false}/></div>;
                                      case "Video": return <div style={{ borderRadius: item.CornerRadius + "px",  height: (item.Height  * (zoomScale/100)) + "px", width: (item.Width  * (zoomScale/100)) + "px", backgroundColor: "transparent", padding: 0, margin: 0, border: "none"}}><img src={item.Content} style={{height: item.Height + "px", width: item.Width + "px"}} draggable={false}/></div>;
                                      default: return <p style={{padding: 0, margin: 0}}> {item.Content} </p>
                                      }
                                  })()}
                              </div>
                            </button>
                            { (selectedElementValue?.ElementIndex !== item.ElementIndex) ? null:
                            <div>
                                <button className={styles.dotButtonStyle} style={{transform: `translate(${(item.Width  * (zoomScale/100)) + 5}px, -13px)`, cursor:"ne-resize"}}onMouseDown={() => {
                                    if (selectedElementValue?.ElementIndex === item.ElementIndex){
                                        setIsChangingSize(true)
                                        setChangingSizeDirection("ne")
                                    }
                                }}><span className={styles.dot} /></button> {/* Right Top */}
                                <button className={styles.dotButtonStyle} style={{transform: `translate(${(item.Width  * (zoomScale/100)) + 5}px, ${((item.Height * (zoomScale/100)) - 24)/2}px)`, cursor:"e-resize"}} onMouseDown={() => {
                                    if (selectedElementValue?.ElementIndex === item.ElementIndex){
                                        setIsChangingSize(true)
                                        setChangingSizeDirection("e")
                                    }
                                }}><span className={styles.dot} /></button>  {/* Right */} 
                                <button className={styles.dotButtonStyle} style={{transform: `translate(${(item.Width  * (zoomScale/100)) + 5}px, ${(item.Height * (zoomScale/100)) - 8}px)`, cursor:"se-resize"}} onMouseDown={() => {
                                    if (selectedElementValue?.ElementIndex === item.ElementIndex){
                                        setIsChangingSize(true)
                                        setChangingSizeDirection("se")
                                    }
                                }}><span className={styles.dot} /></button> {/* Right Bottem */}
                                <button className={styles.dotButtonStyle} style={{transform: `translate(${((item.Width  * (zoomScale/100)) + 5)/2}px, ${((item.Height * (zoomScale/100))- 8)}px)`, cursor:"s-resize"}} onMouseDown={() => {
                                    if (selectedElementValue?.ElementIndex === item.ElementIndex){
                                        setIsChangingSize(true)
                                        setChangingSizeDirection("s")
                                    }
                                }}><span className={styles.dot} /></button> {/* Bottem */}
                                <button className={styles.dotButtonStyle} style={{transform: `translate(0px, ${(item.Height  * (zoomScale/100)) - 8 }px)`, cursor:"sw-resize"}} onMouseDown={() => {
                                    if (selectedElementValue?.ElementIndex === item.ElementIndex){
                                        setIsChangingSize(true)
                                        setChangingSizeDirection("sw")
                                    }
                                }}><span className={styles.dot} /></button> {/* Left Bottem */}
                                <button className={styles.dotButtonStyle} style={{transform: `translate(0px, ${((item.Height  * (zoomScale/100)) + 5)/2}px)`, cursor:"w-resize"}} onMouseDown={() => {
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
                                <button className={styles.dotButtonStyle} style={{transform: `translate(${((item.Width  * (zoomScale/100)) + 5)/2}px, -13px)`, cursor:"n-resize"}} onMouseDown={() => {
                                    if (selectedElementValue?.ElementIndex === item.ElementIndex){
                                        setIsChangingSize(true)
                                        setChangingSizeDirection("n")
                                    }
                                }}><span className={styles.dot} /></button> {/* Top */}
                            </div>
                            }
                            </div>
                          </div> 
                          ))}
                          </div>
                        </div>
                      {/* mark */}
                      </div>
                    </div>
                  {/* mark */}
                </Col>
                    {/* </div>
                </Col> */}
                
              </Row>
              <Row>
                <div className={styles.CardToolbarDiv}>
                  <Stack direction='horizontal' gap={3} style={{padding: 0, margin: 0, width: "100%", backgroundColor: "white"}}>
                    <div style={{display: "table"}}>
                    <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle", height:"50%"}}>
                      <InputGroup hasValidation>
                        <InputGroup.Text id="inputGroupPrepend" onClick={() => {
                          if (zoomScale >= 10){
                            setZoomScale((zoomScale - 10))
                            // const { setTransform } = areaContainerZoomRef.current
                            // setTransform(100,200,zoomScale/100)
                          }
                        }} style={{backgroundColor: "white", padding:0 ,borderLeft: "2px solid black", borderBottom: "2px solid black", borderTop: "2px solid black"}}><FaArrowLeft /></InputGroup.Text>
                        <Form.Control
                          id="SetZoom"
                          onKeyDown={ (evt) => evt.key === 'e' && evt.preventDefault() } 
                          value={zoomScale + "%"}
                          onChange={(event) => { onChangeSetZoomScale(event.target.value) }}
                          className={styles.sizeForm}
                          style={{color:"blue", borderRadius: 0, borderRight: "none", borderLeft: "none", borderBottom: "2px solid black", borderTop: "2px solid black"}}
                        />
                        <InputGroup.Text id="inputGroupAfter" onClick={() => {
                          if (zoomScale <= 500){
                            console.log(zoomScale)
                            const newZoom: number = parseInt(zoomScale)
                            setZoomScale((newZoom + 10))
                            // const { setTransform } = areaContainerZoomRef.current
                            // setTransform(100,200,zoomScale/100)
                          }
                        }} style={{backgroundColor: "white", padding: 0, borderRight: "2px solid black", borderBottom: "2px solid black", borderTop: "2px solid black"}}><FaArrowRight/></InputGroup.Text>
                      </InputGroup>
                      <input type="range" min="10" max="500" value={zoomScale} onChange={changeEvent => {
                            // const { setTransform } = areaContainerZoomRef.current
                            // setTransform(100,200,zoomScale/100)
                            setZoomScale(changeEvent.target.value) 
                          }} className={styles.slider} id="myRange" />
                    </div>
                    </div>
                    <div style={{display: "table"}}>
                      <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle"}}>
                        <Button className={styles.DropdownButtonStyle}>
                            <div style={{height:"2vh"}} onClick={e => addComponent(e,  {ElementType: "Text", Content: "Text", Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: components.length + 1, ElementIndex: components.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans"})}>
                              <img src={textIcon} className={styles.imgContainer }/>
                            </div>
                        </Button>
                      </div>
                    </div>
                    <div style={{display: "table"}}>
                      <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle"}}>
                        <Dropdown drop='up'>
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
                    </div>
                    <div style={{display: "table"}}>
                      <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle"}}>
                        <Button onClick={() => {setIsShowingPaulyLibrary(!isShowingPaulyLibaray)}} className={styles.DropdownButtonStyle}>
                          <div style={{height:"2vh"}}>
                              <img src={imageIcon} className={styles.imgContainer}/>
                            </div>
                        </Button>
                      </div>
                    </div>
                    {/* Mode Selection */}
                    <div>
                      <Stack direction='horizontal'>
                        <div style={{display: "table"}}>
                          <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle"}}>
                            <Button onClick={() => {
                              setSelectedDeviceMode(SelectedAspectType.Small)
                            }} className={styles.DropdownButtonStyle}>
                              <div style={{height:"2vh"}}>
                                  <RiComputerFill color='black' />
                                </div>
                            </Button>
                          </div>
                        </div>
                        <div style={{display: "table"}}>
                          <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle"}}>
                            <Button onClick={() => {
                              setSelectedDeviceMode(SelectedAspectType.Medium)
                            }} className={styles.DropdownButtonStyle}>
                              <div style={{height:"2vh"}}>
                                  <BsTabletLandscape color='black' />
                                </div>
                            </Button>
                          </div>
                        </div>
                        <div style={{display: "table"}}>
                          <div style={{display: "table-cell", textAlign: "center", verticalAlign: "middle"}}>
                            <Button onClick={() => {
                              setSelectedDeviceMode(SelectedAspectType.Large)
                            }} className={styles.DropdownButtonStyle}>
                              <div style={{height:"2vh"}}>
                                  <FcIphone color='black' />
                                </div>
                            </Button>
                          </div>
                        </div>
                      </Stack>
                    </div>
                  </Stack>
                </div>
              </Row>
          </Container>
        </div>
        {
          //Settings menu
          isShowingSettings ?
          <>
           
              <div className={styles.EditCardTopView}>
                <Card className={styles.settingsCard}>
                  <Card.Body>
                      <Stack direction='horizontal'>
                      { (selectedSettingsMode === SelectedSettingsModeType.Members) ? 
                        <div>Members</div>:null
                      }
                      { (selectedSettingsMode === SelectedSettingsModeType.Gerneral) ? 
                        <div>General</div>:null
                      }
                      { (selectedSettingsMode === SelectedSettingsModeType.Discription) ? 
                        <Stack>
                          <p> Edit Use </p>
                          <p> Current Use: {SelectedCard.Use}</p>
                          <Form.Label htmlFor="overlayUse">Use</Form.Label>
                          <Form.Control id="overlayUse"/>
                        </Stack>:null
                      }
                        <Stack>
                          <button onClick={() => {
                            setSelectedSettingsMode(SelectedSettingsModeType.Discription)
                          }}>Discription</button>
                          <button onClick={() => {
                            setSelectedSettingsMode(SelectedSettingsModeType.Members)
                          }}>Members</button>
                          <button onClick={() => {
                            setSelectedSettingsMode(SelectedSettingsModeType.Gerneral)
                          }}>General</button>
                        </Stack>
                      </Stack>
                  </Card.Body>
                </Card>
              </div>
          </> : null
        }
        {
          //Pauly Library
          isShowingPaulyLibaray ?
          <>
            <input type="file" accept="'image/gif', 'image/jpeg', 'image/png', 'image/avif', 'application/pdf', 'image/svg+xml', 'image/webp', 'image/bmp', 'audio/aac', 'video/x-msvideo', 'audio/mpeg', 'video/mp4', 'video/mpeg', 'audio/webm', 'video/webm', 	'video/quicktime', 'application/pdf', 'text/csv', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/rtf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.apple.keynote', 'application/vnd.apple.pages', 'application/vnd.apple.numbers'" onChange={handleFileChange} style={{display: "none"}} ref={fileInputRef}/>
            {
              isShowingUpload ? 
              <div>
                {
                  isShowingMicrosoftUpload ? 
                  <div className={styles.ImageLibraryView}>
                    <Card className={styles.ImageLibraryViewCard}>
                      <Card.Text>
                        <Stack direction='horizontal'>
                          <h1 style={{textAlign: "left"}} className={styles.ImageLibraryViewTitle}>Upload File From Microsoft</h1>
                          <Button variant="primary" style={{display: "flex", alignContent: "right", marginLeft: "auto", marginRight: "3%"}} onClick={() => {setIsShowingUpload(false); setIsShowingMicrosoftUpload(false)}}>Back</Button>
                        </Stack>
                      </Card.Text>
                      <Card.Body>
                        <Button onClick={() => {setSelectedMicrosoftUploadMode(MicrosoftUploadModeType.Personal)}}>
                          Personal
                        </Button>
                        <Button onClick={() => {setSelectedMicrosoftUploadMode(MicrosoftUploadModeType.ShareLink)}}>
                          Link
                        </Button>
                        <Button onClick={() => {setSelectedMicrosoftUploadMode(MicrosoftUploadModeType.Site)}}>
                          Teams
                        </Button>
                        { (selectedMicrosoftUploadMode === MicrosoftUploadModeType.Personal) ? 
                          <div>
                            Personal
                          </div>:null
                        }
                        { (selectedMicrosoftUploadMode === MicrosoftUploadModeType.ShareLink) ? 
                          <div>
                            Link
                          </div>:null
                        }
                        { (selectedMicrosoftUploadMode === MicrosoftUploadModeType.Site) ? 
                          <div>
                            Site
                          </div>:null
                        }
                      </Card.Body>
                    </Card>
                  </div>:
                  <div className={styles.ImageLibraryView}>
                    <Card className={styles.ImageLibraryViewCard}>
                      <Card.Text>
                        <Stack direction='horizontal'>
                          <h1 style={{textAlign: "left"}} className={styles.ImageLibraryViewTitle}>Upload File</h1>
                          <Button variant="primary" style={{display: "flex", alignContent: "right", marginLeft: "auto", marginRight: "3%"}} onClick={() => {setIsShowingUpload(false)}}>Back</Button>
                        </Stack>
                      </Card.Text>
                      <Card.Body>
                        <Stack direction='horizontal'>
                          <Card>
                            {fileUrl &&  (selectedFile.type === "image/jpeg") && <img src={fileUrl} alt="User-selected image" style={{height: "100px", width: "100px" }} />}
                            {fileUrl && (selectedFile.type === "video/mp4") &&(
                              <video controls  ref={videoElement}>
                                <source src={fileUrl} type="video/mp4" />
                                Your browser does not support video.
                              </video>
                            )}
                            {fileUrl &&  (selectedFile.type === "image/gif") && <img src={fileUrl} alt="User-selected image" style={{height: "100px", width: "100px" }} />}
                          </Card>
                          <Stack>
                            {fileSize > 0 && <p>Selected file size: {fileSize} bytes</p>}
                            {fileType && <p>Selected file type: {fileType}</p>}
                            {fileName && <p>Selected file name: {fileName}</p>}
                          </Stack>
                          <Stack direction='horizontal'>
                            {/* <Stack direction='horizontal'>
                              <p>Members</p>
                              <p>Owners</p>
                              <p>Contributes</p>
                              <p>Viewers</p>
                            </Stack> */}
                            <div style={{width: "10vw"}}>
                              <Stack>
                                <p style={{textAlign: "center"}}>Users</p>
                                {fileUsers?.map((item: fileUserType) => (
                                  <p> {item.UsersName} </p>
                                ))}
                              </Stack>
                            </div>
                            <div style={{width: "10vw"}}>
                              <Stack>
                                <p>Owner</p>
                                {fileUsers?.map((item: fileUserType) => (
                                  <div style={{width: "15%", height: "15%"}}>
                                    <SplashCheckmark isPressed={item.Owner} setIsPressed={() => {
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
                                    }}/>
                                  </div>
                                ))}
                              </Stack>
                            </div>
                            <div style={{width: "10vw"}}>
                              <Stack>
                                <p>Contributers</p>
                                {fileUsers?.map((item: fileUserType) => (
                                  <div style={{width: "15%", height: "15%"}}>
                                    <SplashCheckmark isPressed={item.Contributer} setIsPressed={() => {
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
                                    }}/>
                                  </div>
                                ))}
                              </Stack>
                            </div>
                            <div style={{width: "10vw"}}>
                              <Stack>
                                <p>Viewer</p>
                                {fileUsers?.map((item: fileUserType) => (
                                  <div style={{width: "15%", height: "15%"}}>
                                    <div style={{ margin: "auto"}}>
                                      <SplashCheckmark isPressed={item.Viewer} setIsPressed={() => {
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
                                    }} />
                                    </div>
                                  </div>
                                ))}
                              </Stack>
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
                  </div>
                }
              </div>:
              <div className={styles.ImageLibraryView}>
                <Card className={styles.ImageLibraryViewCard}>
                  <Card.Title>
                    <Stack direction='horizontal'>
                      <h1 style={{textAlign: "left"}} className={styles.ImageLibraryViewTitle}>Library</h1>
                      <Button variant="primary" style={{display: "flex", alignContent: "right", marginLeft: "auto", marginRight: "3%"}} onClick={() => {setIsShowingPaulyLibrary(false)}}>Close</Button>
                    </Stack>

                  </Card.Title>
                  <Card.Body>
                    <Card>
                      <Stack direction='horizontal' gap={1}>
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
                        <>
                          <Stack>
                          {arrayChunk(files, 3, SelectedImageLibraryMode).map((row, i) => (
                            <Stack direction='horizontal'>
                              {row.map((item: fileType) => (
                                <div key={item.uniqueID} style={{width: "30%", height: "30%", position: "relative"}}>
                                  <button onClick={() => {
                                    const NewComponents = [...files]
                                    const SelectedIndex = files.findIndex((element: fileType) => element.uniqueID === item.uniqueID)
                                    NewComponents[SelectedIndex]["selected"] = !NewComponents[SelectedIndex]["selected"]
                                    setFiles(NewComponents)
                                    if (NewComponents[SelectedIndex]["selected"]){
                                      setSelectedFileLibrary(NewComponents[SelectedIndex])
                                    } else {
                                      setSelectedFileLibrary(null)
                                    }
                                  }}
                                  style={{
                                    border: "none",
                                    background: "transparent"
                                  }}
                                  >
                                    <div style={{display: "inline"}}>
                                      {(item.fileURL == null) ?
                                        <p>File Loading</p>: <>
                                          { (SelectedImageLibraryMode === SelectedImageLibraryModeType.Gifs || SelectedImageLibraryMode === SelectedImageLibraryModeType.Images) ? 
                                          <img src={item.fileURL} alt='Oh No' style={ item.selected ?
                                            {width: "100%", height:"100%", border: "5px solid red"}:{width: "100%", height:"100%"}
                                          }/>:null
                                          }
                                          {(SelectedImageLibraryMode === SelectedImageLibraryModeType.Videos) ?
                                            <>{!!item.fileURL && (
                                              <div style={{width: "100%", height: "100%", position: "relative"}}>
                                                <VideoContainer url={item.fileURL} />
                                              </div>
                                            )}
                                            </>:null
                                          }
                                        </>
                                      }
                                    </div>
                                  </button>
                              </div>
                              ))}
                            </Stack>
                          ))}
                          </Stack>
                        </>
                        {(SelectedImageLibraryMode === SelectedImageLibraryModeType.PDFS) ? 
                        <> 
                          <p> This is pdfs </p>
                        </>:null}
                      <Stack direction='horizontal'>
                        <Button onClick={(e) => {
                          addComponent(e,  {ElementType: "Image", Content: selectedFileLibrary.fileURL, Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: components.length + 1, ElementIndex: components.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans"})
                          setIsShowingPaulyLibrary(false)
                        }} disabled={selectedFileLibrary === null}>
                          <p>Select</p>
                        </Button>
                        <button className={styles.ImageLibraryButton}>
                          <p style={{padding: 0, margin: 0}}>Edit</p>
                        </button>
                        <Dropdown dir='up'>
                          <Dropdown.Toggle id="dropdown-custom-components" bsPrefix={styles.DropdownButtonStyle} dir='up'>
                            <div style={{height:"2vh"}}>
                              <p>Upload</p>
                            </div>
                          </Dropdown.Toggle>
                          <DropdownMenu>
                            <Dropdown.Item eventKey="1" onClick={handleMicrosoftButtonClick}>Choose From One Drive</Dropdown.Item>
                            <Dropdown.Item eventKey="2" onClick={handleFileButtonClick}>Upload File</Dropdown.Item>
                          </DropdownMenu>
                        </Dropdown>
                      </Stack>
                    </Card>
                </Card.Body>
              </Card>
            </div>
            }
          </> :null
        }
        {
          //Bind Page
          isShowingBindPage ? 
          <>
            <div className={styles.ImageLibraryView}>
              <Card>
                <Card.Title>
                  <Stack direction='horizontal'>
                    <h1 style={{textAlign: "left"}} className={styles.ImageLibraryViewTitle}>Bind</h1>
                    <Button variant="primary" style={{textAlign: "right"}} onClick={() => {setIsShowingBindPage(false)}}>Back</Button>
                  </Stack>
                </Card.Title>
                <Card.Body>
                  <Stack direction='horizontal'>
                    <Button onClick={() => {setSelectedCardBindMode(SelectedCardBindModeType.Class)}}>
                      Class
                    </Button>
                    <Button onClick={() => {setSelectedCardBindMode(SelectedCardBindModeType.Commission)}}>
                      Commission
                    </Button>
                    <Button onClick={() => {setSelectedCardBindMode(SelectedCardBindModeType.Sport)}}>
                      Sport
                    </Button>
                  </Stack>
                  <Card>
                    { (selectedCardBindMode === SelectedCardBindModeType.Class) ? 
                      <>
                        <p>Class</p>
                      </>:null
                    }
                    { (selectedCardBindMode === SelectedCardBindModeType.Commission) ? 
                      <>
                        <p>Commission</p>
                      </>:null
                    }
                    { (selectedCardBindMode === SelectedCardBindModeType.Sport) ? 
                      <>
                        <p>Sport</p>
                      </>:null
                    }
                  </Card>
                </Card.Body>
              </Card>
            </div>
          </>:null
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
