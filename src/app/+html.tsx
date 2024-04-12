/*
  Pauly
  Andrew Mainella
  November 22 2023
  +html.tsx
  holds based html for web version. Used to add apple itunes meta tag.
*/
import React, { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        {/* General Meta Tags */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link rel="manifest" href="/manifest.json" />
        <style type="text/css">
          {`
          body {
            overflow: hidden; /* Hide scrollbars */
          }
        `}
        </style>

        <meta name="apple-itunes-app" content="app-id=6445966725" />
        {/* Preview Meta Tags*/}
        <meta name="author" content="Andrew Mainella" />

        {/* OG Meta Tags*/}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Pauly" />
        <meta property="og:description" content="Pauly, an app for students by students. Built by the 2023-2024 Student Council."></meta>
        <meta property="og:image" content={process.env.EXPO_PUBLIC_PAULYHOST + "/Pauly-og-Image.png"} />  

        {/* Twitter Meta Tags*/}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pauly" />
        <meta name="twitter:description" content="Pauly, an app for students by students. Built by the 2023-2024 Student Council." />
        <meta name="twitter:image" content={process.env.EXPO_PUBLIC_PAULYHOST +"/Pauly-og-Image.png"}/>
      </head>
      <body>{children}</body>
    </html>
  );
}
