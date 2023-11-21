/*
  Pauly
  Andrew Mainella
  
*/
import { View, Platform } from 'react-native';
import React from 'react';
import WebView from 'react-native-webview';
import YoutubeWeb from './youtubeIframeFunction';

export default function SportsYoutube({
  videoId,
  width,
  height = undefined,
}: {
  videoId: string;
  width: number;
  height: number | undefined;
}) {
  if (Platform.OS === 'web') {
    return (
      <View style={{ width, height: height || (width / 16) * 9 }}>
        <YoutubeWeb
          id={videoId}
          width={width}
          height={height || (width / 16) * 9}
        />
      </View>
    );
  }
  return (
    <WebView
      source={{
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width">
            <style>
              body {
                margin: 0px;
                height: ${height || (width / 16) * 9}px;
              }
            </style>
          </head>
          <body>
            <!-- 1. The <iframe> (and video player) will replace this <div> tag. -->
            <div id="player" className="player"></div>
        
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
                  height: '${height || (width / 16) * 9}',
                  width: '${width}',
                  videoId: '${videoId}',
                  playerVars: {
                    'playsinline': 1,
                    'loop': 1,
                    'rel':0,
                    'playsinline':1
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
      `,
      }}
      style={{
        width,
        height: height || (width / 16) * 9,
        position: 'absolute',
      }}
      automaticallyAdjustContentInsets={false}
      scrollEnabled={false}
      scalesPageToFit={false}
      allowsInlineMediaPlayback
    />
  );
}
