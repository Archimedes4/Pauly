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
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="author" content="Andrew Mainella" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="apple-itunes-app" content="app-id=6445966725" />
        <link rel="manifest" href="/manifest.json" />
        <style type="text/css">
          {`
          body {
            overflow: hidden; /* Hide scrollbars */
          }
        `}
        </style>

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Pauly" />
      </head>
      <body>{children}</body>
    </html>
  );
}
