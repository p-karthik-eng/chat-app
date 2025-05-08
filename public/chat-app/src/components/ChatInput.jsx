import React, { useState } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import styled from "styled-components";
import Picker from "emoji-picker-react";

export default function ChatInput({ handleSendMsg }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (event, emojiObject) => {
    let message = msg;
    message += emojiObject.emoji;
    setMsg(message);
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
    }
  };

  return (
    <Container>
      <div className="button-container">
        <div className="emoji">
          <BsEmojiSmileFill onClick={handleEmojiPickerhideShow} />
          {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
        </div>
      </div>
      <form className="input-container" onSubmit={(event) => sendChat(event)}>
        <input
          type="text"
          placeholder="type your message here"
          onChange={(e) => setMsg(e.target.value)}
          value={msg}
        />
        <button type="submit">
          <IoMdSend />
        </button>
      </form>
    </Container>
  );
}

const Container = styled.div`
display: grid;
align-items: center;
grid-template-columns: 10% 90%;  // Adjusted to give more space for the input on mobile
background-color: #080420;
padding: 0 2rem;

@media screen and (max-width: 720px) {
  grid-template-columns: 15% 85%;  // Adjust layout for mobile screens
  padding: 0 1rem;  // Reduced padding on mobile
  gap: 0.5rem; // Reduced gap between elements on mobile
}

.button-container {
  display: flex;
  align-items: center;
  color: white;
  gap: 1rem;

  .emoji {
    position: relative;

    svg {
      font-size: 1.5rem;
      color: #ffff00c8;
      cursor: pointer;
    }

    .emoji-picker-react {
      position: absolute;
      top: -350px;
      background-color: #080420;
      box-shadow: 0 5px 10px #9a86f3;
      border-color: #9a86f3;

      .emoji-scroll-wrapper::-webkit-scrollbar {
        background-color: #080420;
        width: 5px;
        &-thumb {
          background-color: #9a86f3;
        }
      }

      .emoji-categories {
        button {
          filter: contrast(0);
        }
      }

      .emoji-search {
        background-color: transparent;
        border-color: #9a86f3;
      }

      .emoji-group:before {
        background-color: #080420;
      }
    }
  }
}

.input-container {
  width: 100%;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  background-color: #ffffff34;

  input {
    width: 90%;
    height: 60%;
    background-color: transparent;
    color: white;
    border: none;
    padding-left: 1rem;
    font-size: 1.2rem;

    &::selection {
      background-color: #9a86f3;
    }

    &:focus {
      outline: none;
    }

    @media screen and (max-width: 720px) {
      font-size: 1rem; // Adjusted font size for mobile
    }
  }

  button {
    padding: 0.3rem 2rem;
    border-radius: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #9a86f3;
    border: none;

    @media screen and (max-width: 720px) {
      padding: 0.3rem 1rem; // Reduced padding for mobile
      svg {
        font-size: 1.5rem; // Adjusted icon size for mobile
      }
    }

    svg {
      font-size: 2rem;
      color: white;
    }
  }
}
`;
