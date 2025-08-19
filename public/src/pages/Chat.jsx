import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [showContacts, setShowContacts] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const heartbeatRef = useRef(null);

  // ✅ Load logged in user
  useEffect(() => {
    const checkUser = () => {
      if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
        navigate("/login");
      } else {
        setCurrentUser(
          JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY))
        );
      }
    };
    checkUser();
  }, [navigate]);

  // ✅ Connect socket
  useEffect(() => {
    if (currentUser) {
      socket.current = io(host, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 60000,
        forceNew: true,
        autoConnect: true,
        query: { userId: currentUser._id },
      });

      socket.current.on("connect", () => {
        console.log("🔌 Socket connected:", socket.current.id);
        setSocketConnected(true);
        socket.current.emit("add-user", currentUser._id);
        startHeartbeat();
      });

      socket.current.on("disconnect", (reason) => {
        console.log("🔌 Socket disconnected:", reason);
        setSocketConnected(false);
        stopHeartbeat();
      });

      socket.current.on("connect_error", (error) => {
        console.error("🔌 Socket connection error:", error);
        setSocketConnected(false);
        stopHeartbeat();
      });

      socket.current.on("reconnect", () => {
        console.log("🔌 Socket reconnected");
        setSocketConnected(true);
        socket.current.emit("add-user", currentUser._id);
        startHeartbeat();
      });

      // ✅ Listen for incoming messages
      socket.current.on("msg-receive", (msg) => {
        console.log("📩 Incoming message:", msg);
        // you can pass this into ChatContainer via props if needed
      });

      return () => {
        if (socket.current) {
          socket.current.off("msg-receive");
          stopHeartbeat();
          socket.current.disconnect();
        }
      };
    }
  }, [currentUser]);

  // ✅ Heartbeat
  const startHeartbeat = () => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    heartbeatRef.current = setInterval(() => {
      if (socket.current && socket.current.connected) {
        socket.current.emit("ping");
        console.log("💓 Heartbeat sent");
      }
    }, 30000);
  };

  const stopHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  // ✅ Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          try {
            const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
            setContacts(data.data);
          } catch (error) {
            console.error("Error fetching contacts:", error);
          }
        } else {
          navigate("/setAvatar");
        }
      }
    };
    fetchContacts();
  }, [currentUser, navigate]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
    if (window.innerWidth <= 768) {
      setShowContacts(false);
    }
  };

  const toggleContacts = () => {
    setShowContacts(!showContacts);
  };

  return (
    <Container>
      <SocketStatus connected={socketConnected} />

      <div className="container">
        <div className={`contacts-section ${showContacts ? "show" : ""}`}>
          <Contacts
            contacts={contacts}
            changeChat={handleChatChange}
            onToggleContacts={toggleContacts}
          />
        </div>

        <div className="chat-section">
          {currentChat === undefined ? (
            <Welcome />
          ) : (
            <ChatContainer
              currentChat={currentChat}
              socket={socket}
              socketConnected={socketConnected}
              onToggleContacts={toggleContacts}
            />
          )}
        </div>

        <MobileToggle onClick={toggleContacts}>
          <span>☰</span>
        </MobileToggle>
      </div>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  overflow: hidden;

  .container {
    height: 100vh;
    width: 100vw;
    background-color: #00000076;
    display: flex;
    position: relative;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .contacts-section {
    @media (min-width: 769px) {
      width: 25%;
      min-width: 250px;
    }
  }

  .chat-section {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
`;

const SocketStatus = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 30;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) => (props.connected ? "#4CAF50" : "#f44336")};
  transition: all 0.3s ease;
`;

const MobileToggle = styled.button`
  display: none;
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 20;
  background: #4e0eff;
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
