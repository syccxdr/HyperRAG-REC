import React from "react";
import { CssVarsProvider, styled } from "@mui/joy/styles";
import globalTheme from "./theme";
import Session from "./modules/Session";
import InputPanel from "./modules/InputPanel";
// import NavigationBar from "./components/NavigationBar";
// import ChatBox from "./components/ChatBox";
import UserProfileComponent from "./components/UserProfile";
import Settings from "./components/Settings";
import shopsmart from './assets/images/shopsmart.webp';

const Root = styled("div")({
  width: "100vw",
  height: "100vh",
  display: "flex"
});

const Sidebar = styled("div")({
  width: "280px",
  borderRight: "1px solid #eee",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#f8f9fa"
});

const Logo = styled("div")({
  padding: "20px",
  height: "140px",
  borderBottom: "1px solid #eee",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& img": {
    width: "100%",
    maxHeight: "100%",
    objectFit: "contain"
  }
});

const ChatContainer = styled("div")({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#fff"
});

function App() {
  const [sessionList, setSessionList] = React.useState([]);
  
  return (
    <CssVarsProvider theme={globalTheme}>
      <Root>
        <Sidebar>
          <Logo>
            <img src={shopsmart} alt="AI Shopping Assistant" />
          </Logo>
          <UserProfileComponent />
          <Settings />
        </Sidebar>
        <ChatContainer>
          <Session 
            sessionList={sessionList}
            setSessionList={setSessionList}
          />
          <InputPanel 
            sessionList={sessionList}
            setSessionList={setSessionList}
          />
        </ChatContainer>
      </Root>
    </CssVarsProvider>
  );
}

export default App;
