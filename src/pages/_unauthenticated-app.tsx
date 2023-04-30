import { SignInButton } from "@clerk/nextjs";
import Head from "next/head";

const UnauthenticatedApp = () => {
  return (
    <>
      <Head>
        <title>Calendify</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="align-items flex h-screen w-screen justify-center">
        <SignInButton />
      </div>
    </>
  );
};

export default UnauthenticatedApp;