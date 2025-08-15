import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { IoClose } from "react-icons/io5";
import Logo from "../assets/logo.svg";

export default function Contacts({ contacts, changeChat, onToggleContacts }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);

  useEffect(async () => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    setCurrentUserName(data.username);
    setCurrentUserImage(data.avatarImage);
  }, []);

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  return (
    <>
      {currentUserImage && currentUserImage && (
        <Container>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h3>snappy</h3>
            {/* Mobile close button */}
            <MobileCloseButton onClick={onToggleContacts}>
              <IoClose />
            </MobileCloseButton>
          </div>
          <div className="contacts">
            {contacts.map((contact, index) => {
              return (
                <div
                  key={contact._id}
                  className={`contact ${
                    index === currentSelected ? "selected" : ""
                  }`}
                  onClick={() => changeCurrentChat(index, contact)}
                >
                  <div className="avatar">
                    <img
                      src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                      alt=""
                    />
                  </div>
                  <div className="username">
                    <h3>{contact.username}</h3>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="current-user">
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${currentUserImage}`}
                alt="avatar"
              />
            </div>
            <div className="username">
              <h2>{currentUserName}</h2>
            </div>
          </div>
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 75% 15%;
  overflow: hidden;
  background-color: #080420;
  height: 100%;
  width: 100%;

  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    position: relative;
    padding: 0 1rem;
    
    img {
      height: 2rem;
      @media (max-width: 768px) {
        height: 1.8rem;
      }
    }
    
    h3 {
      color: white;
      text-transform: uppercase;
      font-size: 1.2rem;
      @media (max-width: 768px) {
        font-size: 1rem;
      }
    }
  }

  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    padding: 0 0.5rem;
    
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    
    .contact {
      background-color: #ffffff34;
      min-height: 5rem;
      cursor: pointer;
      width: 100%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;
      
      &:hover {
        background-color: #ffffff44;
      }
      
      .avatar {
        img {
          height: 3rem;
          @media (max-width: 768px) {
            height: 2.5rem;
          }
        }
      }
      
      .username {
        h3 {
          color: white;
          font-size: 1rem;
          @media (max-width: 768px) {
            font-size: 0.9rem;
          }
        }
      }
    }
    
    .selected {
      background-color: #9a86f3;
    }
  }

  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    padding: 0.5rem;
    
    .avatar {
      img {
        height: 4rem;
        max-inline-size: 100%;
        @media (max-width: 768px) {
          height: 3rem;
        }
      }
    }
    
    .username {
      h2 {
        color: white;
        font-size: 1.2rem;
        @media (max-width: 768px) {
          font-size: 1rem;
        }
      }
    }
    
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }

  /* Mobile-specific styles */
  @media (max-width: 768px) {
    grid-template-rows: 12% 73% 15%;
    
    .brand {
      justify-content: space-between;
      padding: 0 1rem;
    }
    
    .contacts {
      padding: 0 0.5rem;
      
      .contact {
        min-height: 4rem;
        padding: 0.3rem;
        
        .avatar img {
          height: 2.5rem;
        }
        
        .username h3 {
          font-size: 0.9rem;
        }
      }
    }
    
    .current-user {
      gap: 1rem;
      padding: 0.3rem;
      
      .avatar img {
        height: 3rem;
      }
      
      .username h2 {
        font-size: 1rem;
      }
    }
  }
`;

const MobileCloseButton = styled.button`
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
