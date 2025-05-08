import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ChatScreen from "./pages/ChatScreen";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SetAvatar from "./pages/SetAvatar";
import ChatContainer from "./components/ChatContainer";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setAvatar" element={<SetAvatar />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:id" element={<ChatScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
