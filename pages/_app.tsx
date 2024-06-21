// _app.tsx
import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { theme } from "@/chakra/theme";
import Layout from "@/components/Layout/Layout";
import { RecoilRoot, useRecoilCallback } from "recoil";
import Head from "next/head";
import { UserProvider } from "@/components/User/UserContext";
import { authModalState } from "@/atoms/authModalAtom";

/**
 * Represents the entire application.
 * `RecoilRoot` allows the entire app (children) to be able to manage its state via Recoil.
 * `ChakraProvider` allows the entire app (children) to be able to use Chakra UI.
 * @param param0 - every page and component is a child of this component
 * @returns App component
 */
export default function App({ Component, pageProps }: AppProps) {

  const resetRecoilState = useRecoilCallback(({ reset }) => () => {
    reset(authModalState);
  });
  
  if (typeof window !== "undefined") {
    localStorage.clear();
  }

  return (
    <RecoilRoot>
      <ChakraProvider theme={theme}>
        <UserProvider>
          <Layout>
            <Head>
              <title>Akoben</title>
            </Head>
            <Component {...pageProps} />
          </Layout>
        </UserProvider>
      </ChakraProvider>
    </RecoilRoot>
  );
}
