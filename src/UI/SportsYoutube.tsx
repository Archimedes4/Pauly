import { View, Platform } from 'react-native'
import React from 'react'
import WebViewCross from './WebViewCross'
import YoutubeWeb from './youtubeIframeFunction'


export default function SportsYoutube({videoId, width, height}:{videoId: string, width: number, height?: number}) {
  return (
    <>
      { (Platform.OS === 'web') ?
        <View style={{width: width, height: height ? height:(width/16) * 9}}>
          <YoutubeWeb id={videoId} width={width} height={height ? height:(width/16) * 9} />
        </View>:
        <WebViewCross rawHtml={
          `
            <!DOCTYPE html>
            <html>
              <head></head>
              <body>
                <!-- 1. The <iframe> (and video player) will replace this <div> tag. -->
                <div id="player"></div>
            
                <script>
                  // 2. This code loads the IFrame Player API code asynchronously.
                  var tag = document.createElement('script');
            
                  tag.src = "https://www.youtube.com/iframe_api";
                  var firstScriptTag = document.getElementsByTagName('script')[0];
                  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            
                  // 3. This function creates an <iframe> (and YouTube player)
                  //    after the API code downloads.
                  var player;
                  function onYouTubeIframeAPIReady() {
                    player = new YT.Player('player', {
                      height: '${(width/16) * 9}',
                      width: '${width}',
                      videoId: '${videoId}',
                      playerVars: {
                        'playsinline': 1
                      },
                      events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange
                      }
                    });
                  }
            
                  // 4. The API will call this function when the video player is ready.
                  function onPlayerReady(event) {
                    event.target.playVideo();
                  }
            
                  // 5. The API calls this function when the player's state changes.
                  //    The function indicates that when playing a video (state=1),
                  //    the player should play for six seconds and then stop.
                  var done = false;
                  function onPlayerStateChange(event) {
                    if (event.data == YT.PlayerState.PLAYING && !done) {
                      setTimeout(stopVideo, 6000);
                      done = true;
                    }
                  }
                  function stopVideo() {
                    player.stopVideo();
                  }
                </script>
              </body>
            </html>
          `} width={width} height={height ? height:(width/16) * 9}/>
      }
    </>
  )
}