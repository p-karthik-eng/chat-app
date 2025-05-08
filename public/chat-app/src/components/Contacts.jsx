import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.svg";

export default function Contacts({ contacts, changeChat }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const data = await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        );
        setCurrentUserName(data.username);
        setCurrentUserImage(data.avatarImage);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    getUserData();
  }, []);

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  return (
    <>
      {currentUserImage && currentUserName && (
        <Container>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h3>snappy</h3>
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

  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    padding: 0.5rem;
    img {
      height: 2rem;
    }
    h3 {
      color: white;
      text-transform: uppercase;
      font-size: 1.5rem;
    }
  }

  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    gap: 0.8rem;
    padding: 0.5rem;
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
      min-height: 4.5rem;
      width: 90%;
      cursor: pointer;
      border-radius: 0.4rem;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: 0.3s ease-in-out;

      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
          font-size: 1.1rem;
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
    gap: 1.5rem;
    padding: 0.5rem;

    .avatar {
      img {
        height: 3.5rem;
        max-inline-size: 100%;
      }
    }

    .username {
      h2 {
        color: white;
        font-size: 1.3rem;
      }
    }
  }

  // Tablet view
  @media screen and (max-width: 1080px) {
    .brand h3 {
      font-size: 1.3rem;
    }

    .contacts .contact {
      .username h3 {
        font-size: 1rem;
      }

      .avatar img {
        height: 2.5rem;
      }
    }

    .current-user {
      gap: 1rem;

      .avatar img {
        height: 3rem;
      }

      .username h2 {
        font-size: 1.1rem;
      }
    }
  }

  // Mobile view
  @media screen and (max-width: 600px) {
    grid-template-rows: 12% 73% 15%;

    .brand {
      flex-direction: column;
      gap: 0.3rem;
      h3 {
        font-size: 1.1rem;
      }
    }

    .contacts {
      gap: 0.6rem;

      .contact {
        padding: 0.3rem;
        .avatar img {
          height: 2rem;
        }
        .username h3 {
          font-size: 0.95rem;
        }
      }
    }

    .current-user {
      flex-direction: column;
      gap: 0.3rem;

      .avatar img {
        height: 2.5rem;
      }

      .username h2 {
        font-size: 1rem;
      }
    }
  }
`;
