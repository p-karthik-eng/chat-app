import React, { useState, useEffect, useRef } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import styled from "styled-components";
import Picker from "emoji-picker-react";

export default function ChatInput({ handleSendMsg, onTyping, disabled = false }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  
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
    if (msg.length > 0 && !disabled) {
      handleSendMsg(msg);
      setMsg("");
      // Stop typing indicator
      setIsTyping(false);
      if (onTyping) onTyping(false);
    }
  };

  // Handle typing indicators
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (msg.length > 0 && !isTyping) {
      setIsTyping(true);
      if (onTyping) onTyping(true);
    }

    if (msg.length === 0 && isTyping) {
      setIsTyping(false);
      if (onTyping) onTyping(false);
    }

    // Set timeout to stop typing indicator after user stops typing
    if (msg.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (onTyping) onTyping(false);
      }, 2000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [msg, isTyping, onTyping]);

  // Cleanup typing indicator on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (onTyping && isTyping) {
        onTyping(false);
      }
    };
  }, [onTyping, isTyping]);

  return (
    <Container>
      <div className="button-container">
        <div className="emoji">
          <BsEmojiSmileFill onClick={handleEmojiPickerhideShow} />
          {showEmojiPicker && (
            <div className="emoji-picker-wrapper">
              <Picker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
      </div>
      <form className="input-container" onSubmit={(event) => sendChat(event)}>
        <input
          type="text"
          placeholder={disabled ? "Connecting..." : "Type your message here..."}
          onChange={(e) => setMsg(e.target.value)}
          value={msg}
          disabled={disabled}
        />
        <button type="submit" disabled={disabled || msg.length === 0}>
          <IoMdSend />
        </button>
      </form>
      
      {/* Connection status message */}
      {disabled && (
        <div className="connection-status">
          <span>Connecting to chat server...</span>
        </div>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 5% 95%;
  background-color: #080420;
  padding: 0 2rem;
  height: 100%;
  position: relative;
  
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    padding: 0 1rem;
    gap: 1rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 12% 88%;
    padding: 0 1rem;
    gap: 0.5rem;
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
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.1);
        }
        
        @media (max-width: 768px) {
          font-size: 1.3rem;
        }
      }
      
      .emoji-picker-wrapper {
        position: absolute;
        bottom: 50px;
        left: -200px;
        z-index: 1000;
        
        @media (max-width: 768px) {
          bottom: 60px;
          left: -150px;
          transform: scale(0.8);
        }
        
        .emoji-picker-react {
          background-color: #080420;
          box-shadow: 0 5px 10px #9a86f3;
          border-color: #9a86f3;
          border-radius: 10px;
          
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
            color: white;
            
            &::placeholder {
              color: #9a86f3;
            }
          }
          
          .emoji-group:before {
            background-color: #080420;
          }
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
    padding: 0.5rem;
    
    @media (max-width: 768px) {
      gap: 1rem;
      padding: 0.3rem;
    }
    
    input {
      width: 90%;
      height: 60%;
      background-color: transparent;
      color: white;
      border: none;
      padding-left: 1rem;
      font-size: 1.2rem;
      outline: none;
      
      @media (max-width: 768px) {
        font-size: 1rem;
        padding-left: 0.8rem;
      }

      &::selection {
        background-color: #9a86f3;
      }
      
      &::placeholder {
        color: #ffffff80;
        @media (max-width: 768px) {
          font-size: 0.9rem;
        }
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
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
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover:not(:disabled) {
        background-color: #997af0;
        transform: scale(1.05);
      }
      
      &:active:not(:disabled) {
        transform: scale(0.95);
      }
      
      &:disabled {
        background-color: #666;
        cursor: not-allowed;
        transform: none;
        opacity: 0.6;
      }
      
      @media screen and (min-width: 720px) and (max-width: 1080px) {
        padding: 0.3rem 1rem;
        svg {
          font-size: 1rem;
        }
      }
      
      @media (max-width: 768px) {
        padding: 0.4rem 1.2rem;
        min-width: 45px;
        min-height: 45px;
      }
      
      svg {
        font-size: 2rem;
        color: white;
        
        @media (max-width: 768px) {
          font-size: 1.5rem;
        }
      }
    }
  }
  
  .connection-status {
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #ff9800;
    color: white;
    padding: 0.3rem 0.8rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    white-space: nowrap;
    
    @media (max-width: 768px) {
      font-size: 0.7rem;
      padding: 0.2rem 0.6rem;
    }
  }
`;
