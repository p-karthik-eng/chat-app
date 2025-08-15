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

  useEffect(async () => {
    if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate("/login");
    } else {
      setCurrentUser(
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        )
      );
    }
  }, []);

  useEffect(() => {
    if (currentUser && host) {
      // Initialize socket connection with OPTIMIZED settings
      socket.current = io(host, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 60000,
        forceNew: true,
        autoConnect: true,
        query: { userId: currentUser._id }
      });

      // Helper to remove all listeners
      const removeAllSocketListeners = () => {
        if (!socket.current) return;
        socket.current.off("connect");
        socket.current.off("disconnect");
        socket.current.off("connect_error");
        socket.current.off("reconnect");
        socket.current.off("reconnect_error");
        socket.current.off("reconnect_failed");
        socket.current.off("reconnect_attempt");
      };

      // Socket connection events
      socket.current.on("connect", () => {
        console.log("🔌 Socket connected:", socket.current.id);
        setSocketConnected(true);
        socket.current.emit("add-user", currentUser._id);
        startHeartbeat();
      });

      socket.current.on("disconnect", (reason) => {
        console.log(`🔌 Socket disconnected (id: ${socket.current.id}), reason: ${reason}`);
        setSocketConnected(false);
        stopHeartbeat();
        if (reason !== 'io client disconnect') {
          console.log("🔄 Attempting to reconnect...");
        } else {
          console.log("🛑 Disconnected by client request.");
        }
      });

      socket.current.on("connect_error", (error) => {
        console.error("🔌 Socket connection error:", error);
        setSocketConnected(false);
        stopHeartbeat();
      });

      socket.current.on("reconnect", (attemptNumber) => {
        console.log(`🔌 Socket reconnected after ${attemptNumber} attempts (id: ${socket.current.id})`);
        setSocketConnected(true);
        socket.current.emit("add-user", currentUser._id);
        startHeartbeat();
      });

      socket.current.on("reconnect_error", (error) => {
        console.error("🔌 Socket reconnection error:", error);
        setSocketConnected(false);
      });

      socket.current.on("reconnect_failed", () => {
        console.error("🔌 Socket reconnection failed");
        setSocketConnected(false);
      });

      socket.current.on("reconnect_attempt", (attemptNumber) => {
        console.log(`🔄 Socket reconnection attempt #${attemptNumber}`);
      });

      // Cleanup function
      return () => {
        if (socket.current) {
          console.log("🔌 Cleaning up socket connection and listeners");
          removeAllSocketListeners();
          stopHeartbeat();
          socket.current.disconnect();
        }
      };
    }
  }, [currentUser, host]);

  // Heartbeat function to keep connection alive
  const startHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }
    
    heartbeatRef.current = setInterval(() => {
      if (socket.current && socket.current.connected) {
        socket.current.emit("ping");
        console.log("💓 Heartbeat sent");
      }
    }, 30000); // Send heartbeat every 30 seconds
  };

  const stopHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  useEffect(async () => {
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
  }, [currentUser]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
    // On mobile, hide contacts after selecting a chat
    if (window.innerWidth <= 768) {
      setShowContacts(false);
    }
  };

  const toggleContacts = () => {
    setShowContacts(!showContacts);
  };

  return (
    <>
      <Container>
        {/* Socket Status Indicator */}
        <SocketStatus connected={socketConnected} />
        
        <div className="container">
          <div className={`contacts-section ${showContacts ? 'show' : ''}`}>
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
          {/* Mobile toggle button */}
          <MobileToggle onClick={toggleContacts}>
            <span>☰</span>
          </MobileToggle>
        </div>
      </Container>
    </>
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
    
    /* Mobile-first approach */
    @media (max-width: 768px) {
      flex-direction: column;
      height: 100vh;
      width: 100vw;
    }

    /* Tablet and desktop */
    @media (min-width: 769px) {
      height: 85vh;
      width: 85vw;
      grid-template-columns: 25% 75%;
    }

    /* Large screens */
    @media (min-width: 1080px) {
      grid-template-columns: 25% 75%;
    }
  }

  .contacts-section {
    /* Mobile: hidden by default, shown when toggled */
    @media (max-width: 768px) {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      z-index: 10;
      transform: translateX(-100%);
      transition: transform 0.3s ease-in-out;
      
      &.show {
        transform: translateX(0);
      }
    }

    /* Desktop: always visible */
    @media (min-width: 769px) {
      width: 25%;
      min-width: 250px;
    }
  }

  .chat-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    @media (max-width: 768px) {
      width: 100%;
      height: 100%;
    }
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
  background-color: ${props => props.connected ? '#4CAF50' : '#f44336'};
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    border: 2px solid ${props => props.connected ? '#4CAF50' : '#f44336'};
    opacity: 0.3;
    animation: ${props => props.connected ? 'pulse 2s infinite' : 'none'};
  }
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.2); opacity: 0.1; }
    100% { transform: scale(1); opacity: 0.3; }
  }
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
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  transition: all 0.3s ease;

  &:hover {
    background: #997af0;
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
