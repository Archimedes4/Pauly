import React, { ReactNode } from "react";

export default function Root({ children }: { children: ReactNode}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        <meta name="apple-itunes-app" content="app-id=6445966725" />

        {/* Other head elements... */}
      </head>
      <body>{children}</body>
    </html>
  );
}
