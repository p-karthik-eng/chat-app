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


  

  // Fetching user data and checking for login
  useEffect(() => {
    const getUserData = async () => {
      const user = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
      if (!user) {
        navigate("/login");
      } else {
        setCurrentUser(JSON.parse(user));
      }
    };
    getUserData();
  }, [navigate]);

  // Initializing socket connection
  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);

      return () => {
        socket.current.disconnect();  // Cleanup on component unmount
      };
    }
  }, [currentUser]);

  // Fetching contacts once user is loaded
  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          const response = await axios.get(`${allUsersRoute}/${currentUser._id}`);
          setContacts(response.data);
        } else {
          navigate("/setAvatar");
        }
      }
    };
    fetchContacts();
  }, [currentUser, navigate]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
    if (window.innerWidth <= 720) {
      navigate(`/chat/${chat._id}`);
    }
  };
  
  return (
    <Container>
      <div className="container">
        <Contacts contacts={contacts} changeChat={handleChatChange} />
        {currentChat === undefined ? (
          <Welcome />
        ) : (
          <ChatContainer currentChat={currentChat} socket={socket} />
        )}
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

  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    grid-gap: 1rem;
    border-radius: 1rem;
    overflow: hidden;

    // Tablet layout
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }

    // Mobile layout
    @media screen and (max-width: 720px) {
      display: flex;
      flex-direction: column;
      width: 95vw;
      height: 95vh;
      padding: 0.5rem;
    }
  }
`;
