import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import Router from "next/router";
import nProgress from "nprogress";
import "nprogress/nprogress.css";

interface Props {
  session?: Session | null;
}

nProgress.configure({ showSpinner: false });
Router.events.on("routeChangeStart", () => nProgress.start());
Router.events.on("routeChangeComplete", () => nProgress.done());
Router.events.on("routeChangeError", () => nProgress.done());

function MyApp({ Component, pageProps }: AppProps<Props>) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
