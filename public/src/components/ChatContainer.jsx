import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import { IoArrowBack } from "react-icons/io5";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";

export default function ChatContainer({ currentChat, socket, socketConnected, onToggleContacts }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);

  // Load messages when chat changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentChat) return;
      
      try {
        setIsLoading(true);
        const data = await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        );
        const response = await axios.post(recieveMessageRoute, {
          from: data._id,
          to: currentChat._id,
        });
        setMessages(response.data);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [currentChat]);

  // Handle sending messages
  const handleSendMsg = useCallback(async (msg) => {
    if (!socket.current || !socketConnected) {
      console.error("Socket not connected, cannot send message");
      return;
    }

    try {
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );

      // Emit socket event for real-time delivery
      socket.current.emit("send-msg", {
        to: currentChat._id,
        from: data._id,
        msg,
      });

      // Save message to database
      await axios.post(sendMessageRoute, {
        from: data._id,
        to: currentChat._id,
        message: msg,
      });

      // Add message to local state
      const newMessage = { fromSelf: true, message: msg };
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, [socket, socketConnected, currentChat]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket.current) return;

    // Listen for incoming messages
    const handleMessageReceive = (msg) => {
      console.log("📨 Received message via socket:", msg);
      setArrivalMessage({ fromSelf: false, message: msg });
    };

    // Listen for message delivery confirmation
    const handleMessageDelivered = (data) => {
      console.log("✅ Message delivered:", data);
    };

    // Listen for typing indicators
    const handleTypingStart = (data) => {
      console.log("⌨️ User started typing:", data);
    };

    const handleTypingStop = (data) => {
      console.log("⌨️ User stopped typing:", data);
    };

    // Add event listeners
    socket.current.on("msg-recieve", handleMessageReceive);
    socket.current.on("msg-delivered", handleMessageDelivered);
    socket.current.on("typing-indicator", handleTypingStart);
    socket.current.on("typing-stop", handleTypingStop);

    // Cleanup function
    return () => {
      if (socket.current) {
        socket.current.off("msg-recieve", handleMessageReceive);
        socket.current.off("msg-delivered", handleMessageDelivered);
        socket.current.off("typing-indicator", handleTypingStart);
        socket.current.off("typing-stop", handleTypingStop);
      }
    };
  }, [socket]);

  // Handle arrival messages
  useEffect(() => {
    if (arrivalMessage) {
      setMessages(prev => [...prev, arrivalMessage]);
      setArrivalMessage(null);
    }
  }, [arrivalMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send typing indicators
  const sendTypingIndicator = useCallback((isTyping) => {
    if (!socket.current || !socketConnected || !currentChat) return;

    socket.current.emit("typing", {
      to: currentChat._id,
      from: JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY))._id,
      isTyping,
    });
  }, [socket, socketConnected, currentChat]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          {/* Mobile back button */}
          <MobileBackButton onClick={onToggleContacts}>
            <IoArrowBack />
          </MobileBackButton>
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt=""
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
            {/* Connection status indicator */}
            <ConnectionStatus connected={socketConnected} />
          </div>
        </div>
        <Logout />
      </div>
      
      <div className="chat-messages">
        {isLoading ? (
          <div className="loading-messages">
            <span>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <span>No messages yet. Start the conversation!</span>
          </div>
        ) : (
          messages.map((message, index) => (
            <div ref={index === messages.length - 1 ? scrollRef : null} key={uuidv4()}>
              <div
                className={`message ${
                  message.fromSelf ? "sended" : "recieved"
                }`}
              >
                <div className="content">
                  <p>{message.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <ChatInput 
        handleSendMsg={handleSendMsg} 
        onTyping={sendTypingIndicator}
        disabled={!socketConnected}
      />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  height: 100%;
  width: 100%;
  
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  
  @media (max-width: 768px) {
    grid-template-rows: 12% 76% 12%;
  }
  
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    background-color: #080420;
    
    @media (max-width: 768px) {
      padding: 0 1rem;
    }
    
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      
      .avatar {
        img {
          height: 3rem;
          @media (max-width: 768px) {
            height: 2.5rem;
          }
        }
      }
      
      .username {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        h3 {
          color: white;
          font-size: 1.2rem;
          @media (max-width: 768px) {
            font-size: 1rem;
          }
        }
      }
    }
  }
  
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    background-color: #0d0d30;
    
    @media (max-width: 768px) {
      padding: 0.5rem 1rem;
      gap: 0.5rem;
    }
    
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    
    .loading-messages, .no-messages {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      color: #ffffff80;
      font-style: italic;
    }
    
    .message {
      display: flex;
      align-items: center;
      
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        word-wrap: break-word;
        position: relative;
        
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
        
        @media (max-width: 768px) {
          max-width: 80%;
          padding: 0.8rem;
          font-size: 1rem;
        }
        
        p {
          margin: 0;
          line-height: 1.4;
        }
      }
    }
    
    .sended {
      justify-content: flex-end;
      
      .content {
        background-color: #4f04ff21;
        border-bottom-right-radius: 0.3rem;
      }
    }
    
    .recieved {
      justify-content: flex-start;
      
      .content {
        background-color: #9900ff20;
        border-bottom-left-radius: 0.3rem;
      }
    }
  }
`;

const ConnectionStatus = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.connected ? '#4CAF50' : '#f44336'};
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
`;

const MobileBackButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #ffffff20;
  }
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
