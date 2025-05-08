import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";

export default function ChatScreen() {
  const { id } = useParams(); // Contact ID from route
  const [currentChat, setCurrentChat] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const socket = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
    if (!user) {
      navigate("/login");
    } else {
      setCurrentUser(JSON.parse(user));
    }
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }

    return () => {
      socket.current?.disconnect();
    };
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && id) {
      // Get contact list from localStorage
      const contacts = JSON.parse(localStorage.getItem("contacts"));
      const foundContact = contacts?.find((c) => c._id === id);

      if (foundContact) {
        setCurrentChat(foundContact);
      } else {
        // If contact not found, fallback to basic _id only (to avoid crash)
        setCurrentChat({ _id: id });
      }
    }
  }, [id, currentUser]);

  return (
    <div className="w-full h-screen bg-black text-white flex items-center justify-center p-4">
      {currentChat && currentUser && (
        <ChatContainer currentChat={currentChat} socket={socket} />
      )}
    </div>
  );
}
