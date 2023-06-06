import React, { useState, useRef, useEffect } from 'react'
import { Card, Stack, Button, Dropdown } from 'react-bootstrap'
import styles from "./Cards.module.css"
import UploadMicrosoftFile from './uploadMicrosoftFile'
import SplashCheckmark from '../../../UI/SplashCheckmark/SplashCheckmark.tsx';
import VideoContainer from '../../../UI/VideoContainer.tsx';
import DropdownMenu from 'react-bootstrap/esm/DropdownMenu';
import { doc, collection, getDoc, getDocs, getFirestore, addDoc, Timestamp, serverTimestamp, FieldValue, updateDoc, where, query, DocumentData, startAt, limit, startAfter } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, UploadTaskSnapshot, getDownloadURL, getBlob } from 'firebase/storage';
import { useAuth } from '../../../Contexts/AuthContext';
import PDFView from "./PDFView.tsx"
import CustomButton from '../../../UI/CustomButton/CustomButton.tsx';
import HorizontalPicker from "../../../UI/NavBar/NavBarHolder"
import Progress from '../../../UI/ProgressView/Progress.tsx';

type fileUserType = {
    UsersName: string
    UsersId: string
    Owner: boolean
    Contributer: boolean
    Viewer: boolean
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

enum SelectedImageLibraryModeType {
    Recent,
    Images,
    Gifs,
    Videos,
    PDFS
}

enum SelectedAspectType{
    Small,
    Medium,
    Large
}
  
export default function PaulyLibrary({onAddComponent, selectedDeviceMode, onSetIsShowingPaulyLibrary, componentsSmall, componentsMedium, componentsLarge}:{
    onAddComponent: (e: React.SyntheticEvent, newValue:CardElement) => void
    selectedDeviceMode: SelectedAspectType
    onSetIsShowingPaulyLibrary: (item: boolean) => void
    componentsSmall: CardElement[]
    componentsMedium: CardElement[]
    componentsLarge: CardElement[]
}) {
    //Pauly Library
    const fileInputRef = useRef(null);
    const [isShowingUpload, setIsShowingUpload] = useState(false)
    const [isShowingMicrosoftUpload, setIsShowingMicrosoftUpload] = useState(false)
    const [microsoftDrivePath, setMicrosoftDrivePath] = useState("/me/drives")
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
    const videoElement = useRef(null)
    const [fileUsers, setFileUsers] = useState<fileUserType[]>()
    const [collectionPageNumber, setCollectionPageNumber] = useState<number>(1)
    const [selectedFileLibrary, setSelectedFileLibrary] = useState<fileType | null>(null)
    const [SelectedImageLibraryMode, setSelectedImageLibraryMode] = React.useState<SelectedImageLibraryModeType>(SelectedImageLibraryModeType.Images)
    const { app, db, currentUser, currentUserMicrosoftAccessToken } = useAuth()

    const storage = getStorage(app);

    useEffect(() => {
        getUsers()
        setOwners([currentUser.uid])
        setContributers([currentUser.uid])
        setViewers([currentUser.uid])
        getUsersFiles()
        // getPdf("01DNRXO72HSHS2FEC3PFDZ5554MBR2RJN3")
    }, [])

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

    async function uploadData(uploadUrl: string, chunk: Blob, Start: string, End: string, Total: string){
        console.log("This is header", "bytes " + Start + "-" + End + "/" + Total)
        const responce = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                "Content-Length": chunk.size.toString(),
                "Content-Range": "bytes " + Start + "-" + End + "/" + Total
            },
            body: chunk
        })
        const Responce = await responce.json()
        return Responce
    }

    async function downloadPDF(fileId: string, name:string){
        fetch("https://graph.microsoft.com/v1.0/sites/gocrusadersca.sharepoint.com/drive/items/" + fileId + "/content", {
            headers: {
                "Authorization": "Bearer " + currentUserMicrosoftAccessToken
            },
            method: "GET"
        }).then(response => response.blob())
        .then(data => {
            console.log("data", data)
            const blob = new Blob([data], {type: 'application/pdf'});
            setFileSize(blob.size);
            const url = URL.createObjectURL( blob );
            console.log(url)
            setFileUrl(url);
            setFileType("application/pdf");
            setFileName(name);
            const selectedFileNew = new File([blob], name)
            setSelectedFile(selectedFileNew);
        })
    }

    async function downloadAsPDF(fileId: string, name: string){
        fetch("https://graph.microsoft.com/v1.0/sites/gocrusadersca.sharepoint.com/drive/items/" + fileId + "/content?format=pdf", {
            headers: {
                "Authorization": "Bearer " + currentUserMicrosoftAccessToken
            },
            method: "GET"
        }).then(response => response.blob())
        .then(data => {
            console.log("data", data)
            const blob = new Blob([data], {type: 'application/pdf'});
            setFileSize(blob.size);
            const url = URL.createObjectURL( blob );
            console.log(url)
            setFileUrl(url);
            setFileType("application/pdf");
            setFileName(name);
            const selectedFileNew = new File([blob], name)
            setSelectedFile(selectedFileNew);
        })
    }

    async function downloadMicosoftPDF(id: string, name: string) {
        fetch("https://graph.microsoft.com/v1.0/me/drive/items/" + id + "/content", {
            headers: {
                "Authorization": "Bearer " + currentUserMicrosoftAccessToken
            },
            method: "GET"
        }).then(response => response.blob())
        .then(data => {
            console.log("data", data)
            const blob = new Blob([data], {type: 'application/pdf'});
            setFileSize(blob.size);
            const url = URL.createObjectURL( blob );
            console.log(url)
            setFileUrl(url);
            setFileType("application/pdf");
            setFileName(name);
            const selectedFileNew = new File([blob], name)
            setSelectedFile(selectedFileNew);
        })
    }

    async function downloadMicrosoftAsPDF(id: string, name: string){
        fetch("https://graph.microsoft.com/v1.0/me/drive/items/" + id + "/content?format=pdf", {
            headers: {
                "Authorization": "Bearer " + currentUserMicrosoftAccessToken
            },
            method: "GET"
        }).then(response => response.blob())
        .then(data => {
            console.log("data", data)
            const blob = new Blob([data], {type: 'application/pdf'});
            setFileSize(blob.size);
            const url = URL.createObjectURL( blob );
            console.log(url)
            setFileUrl(url);
            setFileType("application/pdf");
            setFileName(name);
            const selectedFileNew = new File([blob], name)
            setSelectedFile(selectedFileNew);
        })
    }

    async function getPdf(fileId: string) {
        fetch("https://graph.microsoft.com/v1.0/sites/gocrusadersca.sharepoint.com/drive/items/" + fileId, {
            headers: {
                "Authorization": "Bearer " + currentUserMicrosoftAccessToken
            },
            method: "GET"
        }).then(response => response.json())
        .then(data => {
            console.log("This is data", data)
            
            if (data["name"] !== undefined) {
                console.log("Ran")
                downloadAsPDF(fileId, data["name"])
            }
        })
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
                fetch("https://graph.microsoft.com/v1.0/sites/gocrusadersca.sharepoint.com/drive/items/01DNRXO75XAD5E4DBG7RGKBHHPL5SPID47:/" + selectedFileNew.name + ":/createUploadSession", {
                    headers: {
                        'Accept':'application/json',
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + currentUserMicrosoftAccessToken
                    },
                    method: "POST",
                    body:JSON.stringify({
                        item: {
                            "@microsoft.graph.conflictBehavior": "rename",
                            "name": selectedFileNew.name 
                        },
                        deferCommit: false
                    })
                }).then(response => response.json())
                .then(data => {
                    console.log(data)
                    const Upload = data["uploadUrl"]
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const blob = new Blob( [ reader.result ] );
                        const chunkSize = 3600000
                        console.log("This is length", blob.size)
                        var start = 0
                        var last = 0
                        const Total = blob.size
                        for (let i = 0; i < blob.size; i += chunkSize) {
                            const chunk = blob.slice(i, i + chunkSize);
                            last = start + chunk.size
                            const result = uploadData(Upload, chunk, start.toString(), (last - 1).toString(), Total.toString())
                            start = last
                            result.then(result => {
                                console.log(result)
                                if (result["id"] !== undefined){
                                    console.log("this")
                                    getPdf(result["id"])
                                }
                            })
                        }
                    };
                    reader.readAsArrayBuffer(selectedFileNew);
                })  
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
    
          const metadata = {
            contentType: fileType,
          };

          // Upload file
          const uploadTask = uploadBytesResumable(storageRef, selectedFile, metadata);
    
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

    const handleFileButtonClick = () => {
        fileInputRef.current.click();
        setIsShowingUpload(true)
    };

    function handleMicrosoftButtonClick(){
        setIsShowingUpload(true)
        setIsShowingMicrosoftUpload(true)
    }

    async function handleDownload(contentFileUrl: string) {
        try {
          const url = await getDownloadURL(ref(storage, contentFileUrl));
          return url
        } catch (error) {
          console.error('Error downloading file:', error);
        }
    };

    async function handelDownloadPDF(contentFileUrl: string) {
        try {
            const blob = await getBlob(ref(storage, contentFileUrl));
            const dataUrl = URL.createObjectURL( blob );
            console.log("URL", dataUrl)
            return dataUrl
        } catch (error) {
        console.error('Error downloading file:', error);
        }
    }

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
            if (image.fileType === "application/pdf"){
                console.log("THis was ran")
                const result = await handelDownloadPDF(image.fileLocation)
                const SelectedIndex = documents.findIndex((element: fileType) => element.uniqueID === image.uniqueID)
                if (SelectedIndex != -1){
                  NewComponents[SelectedIndex]["fileURL"] = result as string
                }
            } else {
                const result = await handleDownload(image.fileLocation)
                const SelectedIndex = documents.findIndex((element: fileType) => element.uniqueID === image.uniqueID)
                if (SelectedIndex != -1){
                  NewComponents[SelectedIndex]["fileURL"] = result as string
                }
            }
        }
        setFiles(NewComponents)
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

    return (
        <>
            <input onClick={() => {setIsShowingUpload(false)}} onBlur={() => {setIsShowingUpload(false); console.log("This")}} type="file" accept="'image/gif', 'image/jpeg', 'image/png', 'image/avif', 'application/pdf', 'image/svg+xml', 'image/webp', 'image/bmp', 'audio/aac', 'video/x-msvideo', 'audio/mpeg', 'video/mp4', 'video/mpeg', 'audio/webm', 'video/webm', 	'video/quicktime', 'application/pdf', 'text/csv', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/rtf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.apple.keynote', 'application/vnd.apple.pages', 'application/vnd.apple.numbers'" onChange={handleFileChange} style={{display: "none"}} ref={fileInputRef}/>
            {
              isShowingUpload ? 
                <div>
                {
                  isShowingMicrosoftUpload ? 
                  <div>
                    <UploadMicrosoftFile onSetIsShowingUpload={setIsShowingUpload} onSetIsShowingMicrosoftUpload={setIsShowingMicrosoftUpload} onSelectedFile={(item) => {
                        setIsShowingUpload(true)
                        setIsShowingMicrosoftUpload(false)
                        downloadMicrosoftAsPDF(item.id, item.name)
                    }}/>
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
                          <Card style={{width: "50vw", height: "40vh"}}>
                            <div style={{height: "100%", width: "100%"}}>
                                {fileUrl &&  (selectedFile.type === "image/jpeg") && <img src={fileUrl} alt="User-selected image" style={{height: "100px", width: "100px" }} />}
                                {fileUrl && (selectedFile.type === "video/mp4") &&(
                                <video controls  ref={videoElement} width={"100%"} height={"100%"}>
                                    <source src={fileUrl} type="video/mp4" />
                                    Your browser does not support video.
                                </video>
                                )}
                                {fileUrl && (selectedFile.type === "image/gif") && <img src={fileUrl} alt="User-selected image" style={{height: "100px", width: "100px" }} />}
                                {fileUrl && (fileType === "application/pdf") && 
                                    <PDFView fileUrl={fileUrl}/>
                                }
                                {(fileUrl === "") ? 
                                    <div>
                                        Please Upload A File
                                    </div>:null
                                }
                            </div>
                          </Card>
                          <Stack>
                            {fileSize > 0 && <p>Selected file size: {fileSize} bytes</p>}
                            {fileType && <p>Selected file type: {fileType}</p>}
                            {fileName && <p>Selected file name: {fileName}</p>}
                          </Stack>
                          <Stack direction='horizontal'>
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
                            <Button variant="primary" style={{display: "flex", alignContent: "right", marginLeft: "auto", marginRight: "3%"}} onClick={() => {onSetIsShowingPaulyLibrary(false)}}>Close</Button>
                            </Stack>
                        </Card.Title>
                        <Card.Body>
                            <Card>
                                <div style={{marginLeft: "2%"}}>
                                    <HorizontalPicker  selectedIndex={0} onSelectedIndexChange={(value: number) => {
                                        if (value === 0) {
                                            setSelectedImageLibraryMode(SelectedImageLibraryModeType.Images)
                                            if (SelectedImageLibraryModeType.Images!== SelectedImageLibraryMode){
                                                setSelectedFileLibrary(null)
                                            }
                                        } else if (value === 1){
                                            setSelectedImageLibraryMode(SelectedImageLibraryModeType.Gifs)
                                            if (SelectedImageLibraryModeType.Gifs!== SelectedImageLibraryMode){
                                                setSelectedFileLibrary(null)
                                            }
                                        } else if (value === 2){
                                            setSelectedImageLibraryMode(SelectedImageLibraryModeType.Videos)
                                            if (SelectedImageLibraryModeType.Videos!== SelectedImageLibraryMode){
                                                setSelectedFileLibrary(null)
                                            }
                                        } else if (value === 3){
                                            setSelectedImageLibraryMode(SelectedImageLibraryModeType.PDFS)
                                            if (SelectedImageLibraryModeType.PDFS!== SelectedImageLibraryMode){
                                                setSelectedFileLibrary(null)
                                            }
                                        }
                                    }} width='10%'>
                                        <p style={{margin: 0, marginTop: "4%", marginBottom: "3%"}}>Images</p>
                                        <p style={{margin: 0, marginTop: "4%", marginBottom: "3%"}}>Gifs</p>
                                        <p style={{margin: 0, marginTop: "4%", marginBottom: "3%"}}>Vidoes</p>
                                        <p style={{margin: 0, marginTop: "4%", marginBottom: "3%"}}>PDFs</p>
                                    </HorizontalPicker>
                                </div>
                                <div style={{overflow: "scroll", height: "46vh", width: "100%"}}>
                                    <Stack>
                                    {arrayChunk(files, 3, SelectedImageLibraryMode).map((row, i) => (
                                        <Stack direction='horizontal'>
                                        {row.map((item: fileType) => (
                                            <div key={item.uniqueID} style={{width: "20%", height: "20%", position: "relative"}}>
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
                                                <div style={{display: "inline", width: "100%", height: "100%"}}>
                                                {(item.fileURL === null) ?
                                                    <div><p>File Loading</p><Progress /></div>:
                                                    <>
                                                        { (SelectedImageLibraryMode === SelectedImageLibraryModeType.Gifs || SelectedImageLibraryMode === SelectedImageLibraryModeType.Images) ? 
                                                        <img src={item.fileURL} alt='Oh No' style={ item.selected ?
                                                            {width: "100%", height:"100%", border: "5px solid red"}:{width: "100%", height:"100%"}
                                                        }/>:null
                                                        }
                                                        {(SelectedImageLibraryMode === SelectedImageLibraryModeType.Videos) ?
                                                            <>{!!item.fileURL && (
                                                            <div style={item.selected ? {width: "100%", height: "100%", position: "relative", border: "5px solid red"}:{width: "100%", height: "100%", position: "relative"}}>
                                                                <VideoContainer url={item.fileURL} />
                                                            </div>
                                                            )}
                                                            </>:null
                                                        }
                                                        {(SelectedImageLibraryMode === SelectedImageLibraryModeType.PDFS) ? 
                                                            <div style={{border: "5px solid red"}}><PDFView fileUrl={item.fileURL} /></div>:null
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
                                </div>
                                <Stack direction='horizontal'>
                                    { (selectedFileLibrary !== null) ? 
                                        <>
                                            <div onClick={(e) => {
                                                if (selectedFileLibrary.fileType ===  "image/jpeg" || selectedFileLibrary.fileType ===  "image/gif"){
                                                    if (selectedDeviceMode === SelectedAspectType.Small){
                                                        onAddComponent(e,  {ElementType: "Image", Content: selectedFileLibrary.fileURL, Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: componentsSmall.length + 1, ElementIndex: componentsSmall.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans", ElementUUID: create_UUID()})
                                                    } else if (selectedDeviceMode === SelectedAspectType.Medium){
                                                        onAddComponent(e,  {ElementType: "Image", Content: selectedFileLibrary.fileURL, Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: componentsMedium.length + 1, ElementIndex: componentsMedium.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans", ElementUUID: create_UUID()})
                                                    } else if (selectedDeviceMode === SelectedAspectType.Large){
                                                        onAddComponent(e,  {ElementType: "Image", Content: selectedFileLibrary.fileURL, Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: componentsLarge.length + 1, ElementIndex: componentsLarge.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans", ElementUUID: create_UUID()})
                                                    }
                                                } else if (selectedFileLibrary.fileType ===  "video/mp4") {
                                                    if (selectedDeviceMode === SelectedAspectType.Small){
                                                        onAddComponent(e,  {ElementType: "Video", Content: selectedFileLibrary.fileURL, Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: componentsSmall.length + 1, ElementIndex: componentsSmall.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans", ElementUUID: create_UUID()})
                                                    } else if (selectedDeviceMode === SelectedAspectType.Medium){
                                                        onAddComponent(e,  {ElementType: "Video", Content: selectedFileLibrary.fileURL, Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: componentsMedium.length + 1, ElementIndex: componentsMedium.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans", ElementUUID: create_UUID()})
                                                    } else if (selectedDeviceMode === SelectedAspectType.Large){
                                                        onAddComponent(e,  {ElementType: "Video", Content: selectedFileLibrary.fileURL, Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: componentsLarge.length + 1, ElementIndex: componentsLarge.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans", ElementUUID: create_UUID()})
                                                    }
                                                } else if (selectedFileLibrary.fileType === "application/pdf") {
                                                    if (selectedDeviceMode === SelectedAspectType.Small){
                                                        onAddComponent(e,  {ElementType: "PDF", Content: selectedFileLibrary.fileURL, Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: componentsSmall.length + 1, ElementIndex: componentsSmall.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans", ElementUUID: create_UUID()})
                                                    } else if (selectedDeviceMode === SelectedAspectType.Medium){
                                                        onAddComponent(e,  {ElementType: "PDF", Content: selectedFileLibrary.fileURL, Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: componentsMedium.length + 1, ElementIndex: componentsMedium.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans", ElementUUID: create_UUID()})
                                                    } else if (selectedDeviceMode === SelectedAspectType.Large){
                                                        onAddComponent(e,  {ElementType: "PDF", Content: selectedFileLibrary.fileURL, Position: {XPosition: 0, YPosition: 0}, Width: 50, Height: 50, CurrentZIndex: componentsLarge.length + 1, ElementIndex: componentsLarge.length + 2, Opacity: 100, CornerRadius: 0, SelectedColor: "#555", SelectedFont: "Open Sans", ElementUUID: create_UUID()})
                                                    }
                                                }
                                                onSetIsShowingPaulyLibrary(false)
                                                }}>
                                                <CustomButton content='Select'/>
                                            </div>
                                            <CustomButton content='Edit'/>
                                        </>:null
                                    }
                                    <Dropdown dir='up'>
                                    <Dropdown.Toggle id="dropdown-custom-components" bsPrefix={styles.LibraryUploadDropdown} dir='up'>
                                        <CustomButton content='upload'/>
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
          </> 
  )
}
