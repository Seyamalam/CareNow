import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
export default function RootHTML({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#194E3E" />
        <meta
          name="description"
          content="CareNow family care exhibition demo for Bangladesh. Built with Expo React Native and Panel UI."
        />
        <title>CareNow · Family care</title>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
