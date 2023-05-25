import React, {useRef, useEffect} from 'react'

const VideoContainerCard = (
    { url }:{ url: string}
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {    
      videoRef.current?.load();
    }, [videoRef, url]);
  
    return (
        <>  
          <video width="100%" height="100%"  ref={videoRef} autoPlay loop>
              <source src={url} />
              Your browser does not support video.
          </video>
        </>
    );
}
export default VideoContainerCard