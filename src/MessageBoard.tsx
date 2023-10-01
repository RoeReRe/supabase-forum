import { Outlet, useLocation } from "react-router-dom";
import { UserContext } from "./App";
import { useContext, useEffect, useState } from "react";
import Login from "./Login";

export default function MessageBoard() {
  const userProfile = useContext(UserContext);
  const location = useLocation();
  const [homeState, setHomeState] = useState(window.location.pathname == "/");
  
  useEffect(() => {
    if (location.pathname == "/") {
      setHomeState(true);
    } else {
      setHomeState(false);
    }
  }, [location]);

  return (
    <div className="message-board-container">
      {userProfile.session ? (
        <div>
          <h2 className="message-board-header-link">Message Board</h2>
          {homeState ? < IntroMessage /> : <></>}
        </div>
      ) : (
        <div>
          <h2 className="message-board-header-link">Welcome to the forum!</h2>
          <h2
            className="message-board-login-message"
            data-e2e="message-board-login"
          >
            Please <Login /> to post and comment.
          </h2>
          < IntroMessage />
        </div>
      )}
      <Outlet />
    </div>
  );
}

export function IntroMessage() {
  return (
    <>
    <div className="message-board-intro-container">
      <h3 className="message-board-intro">This is a simple project for me to learn more about React and databases.</h3>
      <h3
        className="message-board-intro"
      >
        To view my other projects, do visit my repository <a
          href="https://github.com/RoeReRe" target="_blank" className="font-medium text-blue-400 dark:text-blue-500 hover:underline"
        >
          here
        </a>.
      </h3>
    </div>
    <div className="message-board-intro-container mt-8">
      <h3 className="message-board-intro">
        Alternatively, do feel free to browse the forum :{")"}
      </h3>
    </div>
    </>
  );
}