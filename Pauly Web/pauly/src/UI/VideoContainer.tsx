
import React, {useRef, useEffect} from 'react'

// export default function VideoContainer(props: {url: string}) {
//     const videoRef = useRef(null);

//     useEffect(() => {    
//       videoRef.current?.load();
//     }, [url]);
  
//     return (
//       <video ref={videoRef}>
//         <source src={url} />
//         Your browser does not support video.
//       </video>
//     );
// }

const VideoContainer = (
    { url }:{ url: string}
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {    
      videoRef.current?.load();
      console.log(videoRef.current)
      console.log("La La La")
    }, [videoRef, url]);
  
    return (
        <>  
            <video width="100%" height="100%"  ref={videoRef} controls>
                <source src={url} />
                Your browser does not support video.
            </video>
        </>
    );
}
export default VideoContainer