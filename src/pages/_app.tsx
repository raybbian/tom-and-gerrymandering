import "@/styles/globals.css";
import localFont from 'next/font/local'

import type { AppProps } from "next/app";

const shermlock = localFont({
    src: [
        {
            path: '../../public/fonts/Shermlock.ttf',
            weight: '400',
        }
    ],
    variable: '--font-shermlock'
})
export default function App({ Component, pageProps }: AppProps) {
    return (
        <main className={shermlock.variable}>
            <Component {...pageProps} />
        </main>
    
    );

}
