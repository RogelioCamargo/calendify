import { useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import AuthenticatedApp from "./_authenticated-app";
import UnauthenticatedApp from "./_unauthenticated-app";

const Home: NextPage = () => {
  const { isSignedIn } = useUser();

  return isSignedIn ? <AuthenticatedApp /> : <UnauthenticatedApp />;
};

export default Home;
