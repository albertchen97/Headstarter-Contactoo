// This is the home page
import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import {
  mainLogo,
  splashBG,
  magnifyGlass,
  smsLogo,
  emailLogo,
  mapLogo,
} from "../public/imageIndex";
import Chat from "../components/Chat";
import Email from "../components/Email";
import Sms from "../components/Sms";
import Admin from "./admin";
import { listMessages } from "../src/graphql/queries";
import { withSSRContext } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import Modal from "react-modal";
import { ToastContainer } from "react-toastify";
import { createRoom } from "../src/graphql/mutations";

// set modal to root
Modal.setAppElement("#__next");

// @function - Home: The Home component is wrapped in the withAuthenticator HOC (Higher Order Component), which will be rendered after the user signs in.
// @props - messages: All the messages fetched from AWS DynamoDB, and passed by getServerSideProps().
//        - signOut: The signOut function from Amplify, and passed by withAuthenticator().
//        - user: The user object, which includes user's email and username, from AWS Cognito, and passed by withAuthenticator().
function Home({ messages, roomId, signOut, user }) {
  // state and function for toggling live chat
  const [showChat, toggleShowChat] = useState(false);

  const handleShowChat = () => {
    toggleShowChat(showChat ? false : true);
  };

  const [emailIsOpen, setEmailIsOpen] = useState(false);
  const [smsIsOpen, setSmsIsOpen] = useState(false);

  if (user.username == "admin") {
    return <Admin />;
  } else {
    return (
      <div>
        <Head>
          <title>Contactoo</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {/* Main Body */}
        <main className="flex flex-col items-center w-screen text-xl md:text-2xl">
          {/* Nav Bar with title + sign in, the bar will stick to the top of the screen*/}
          <nav className="sticky top-0 z-20 flex items-center justify-center w-full h-16 bg-white md:h-24">
            <div className="flex items-center justify-between w-11/12 md:w-5/6 max-w-7xl">
              {/* logo and title */}
              <div className="flex gap-2">
                <Image src={mainLogo} />
                <h1 className="text-3xl font-bold md:text-5xl">Contactoo</h1>
              </div>
              {/* Greeting Message */}
              {/* "user" is an object that contains the user information fetched from Amazon Cognito and passed in by withAuthenticator(). */}
              <p>Hello, {user.username}</p>
              {/* sign in button */}
              <button
                className="flex items-center justify-center h-10 p-3 text-white bg-black hover:bg-cyan-300 md:h-12 md:p-5 rounded-2xl"
                onClick={signOut}>
                Sign Out
              </button>
            </div>
          </nav>

          {/* Middle section with welcome message + search bar */}
          <div className="relative flex items-center justify-center w-full h-64 md:h-80">
            <Image
              className="object-cover pointer-events-none"
              src={splashBG}
              layout="fill"
              draggable="false"
            />
            <div className="z-10 flex flex-col items-center justify-center w-4/5 max-w-3xl gap-3 whitespace-nowrap md:w-1/2 md:gap-6 ">
              <h1 className="text-3xl font-bold md:text-5xl">
                Contactoo Support
              </h1>
              <h1 className="text-3xl md:text-5xl">How can we help?</h1>

              {/* search bar container */}
              <form className="w-full h-full" action="">
                <div className="relative flex flex-col justify-center item-center">
                  {/* magnifying glass */}
                  <div className="absolute w-10 h-10 md:w-12 md:h-12 right-3">
                    <Image src={magnifyGlass} layout="fill"></Image>
                  </div>

                  {/* actually search bar */}
                  <input
                    className="w-full pl-5 pr-16 h-14 md:h-16 rounded-2xl"
                    type={"text"}
                    placeholder="Search for help"></input>
                </div>
              </form>
            </div>
          </div>

          {/* Bottom tiles for picking service type */}
          <div className="flex flex-wrap justify-center w-11/12 gap-5 md:flex-nowrap md:w-3/4 mt-11 md:mt-14">
            {/* SMS tile */}
            <button
              className="flex flex-col items-center justify-center max-w-md p-8 border border-gray-500 text-start hover:border-cyan-500 hover:text-cyan-500 md:p-10 w-72 h-72 md:h-96 md:w-96 rounded-2xl"
              onClick={() => setSmsIsOpen(true)}>
              <Image src={smsLogo} />
              <p>Message us regarding your questions, comments, or concerns.</p>
            </button>
            <Sms smsIsOpen={smsIsOpen} setSmsIsOpen={setSmsIsOpen} />

            {/* Email tile */}
            <button
              className="flex flex-col items-center justify-center max-w-md p-8 border border-gray-500 text-start hover:border-cyan-500 hover:text-cyan-500 md:p-10 w-72 h-72 md:h-96 md:w-96 rounded-2xl"
              onClick={() => setEmailIsOpen(true)}>
              <Image src={emailLogo} />
              <p>Email us regarding your questions, comments, or concerns.</p>
            </button>
            <Email emailIsOpen={emailIsOpen} setEmailIsOpen={setEmailIsOpen} />
          </div>

          {/* Live Chat Toggle */}
          <button
            className={
              (showChat ? "bg-zinc-500" : "") +
              " fixed bottom-0 right-0 flex items-center h-10 pl-5 pr-5 text-xl transition-all text-white bg-black md:right-5 md:h-16 md:text-3xl "
            }
            onClick={handleShowChat}>
            Live Chat
          </button>

          {/* Live Chat Window */}
          <div
            className={
              (showChat ? "" : "translate-x-full invisible") +
              "  z-30 right-0 md:right-5 fixed md:bottom-16 bottom-10 w-80 h-96 md:h-[32rem] transition-all"
            }>
            <Chat messages={messages} roomId={roomId} />
          </div>
        </main>

        <ToastContainer className={"text-base sm:text-xl"} autoClose={3000} />
      </div>
    );
  }
}

// Server-side rendering, only use in pages and not components, used to get db messages to pass into CHAT component
// https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props
export async function getServerSideProps({ req }) {
  let enableBot = false;

  console.log("In getServerSideProps(): ");

  // wrap the request in a withSSRContext to use Amplify functionality serverside.
  const SSR = withSSRContext({ req });

  try {
    // currentAuthenticatedUser() will throw an error if the user is not signed in.
    const user = await SSR.Auth.currentAuthenticatedUser();

    const roomDetail = {
      id: "1234",
      session: "open",
    };

    const roomResponse = await SSR.API.graphql({
      query: createRoom,
      variables: { input: roomDetail },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    const messageDetail = {
      roomId: roomResponse.data.createRoom.roomId,
      limit: 10,
      nextToken: "",
    };

    // If we make it passed the above line, that means the user is signed in.
    const response = await SSR.API.graphql({
      query: listMessages,
      variables: messageDetail,
      // use authMode: AMAZON_COGNITO_USER_POOLS to make a request on the current user's behalf
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
    console.log("Successfully got the user authentication information.");
    // return all the messages from the dynamoDB
    console.log(roomResponse.data.createRoom.roomId);
    return {
      props: {
        messages: response.data.listMessages.items,
        roomId: roomResponse.data.createRoom.roomId,
      },
    };
  } catch (error) {
    // We will end up here if there is no user signed in.
    // We'll just return a list of empty messages.
    console.log("error in getServerSideProps()", error);
    return {
      props: {
        messages: [],
      },
    };
  }
}

// The export must be at the bottom of this file, otherwise Next.js will give you this error:
// "Error: The default export is not a React Component in page: " / ""
// StackOverflow Thread: https://stackoverflow.com/questions/59873698/the-default-export-is-not-a-react-component-in-page-nextjs
export default withAuthenticator(Home);
