import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Robot from "../assets/robot.gif";

export default function Welcome() {
  const [userName, setUserName] = useState("Loading...");

  useEffect(() => {
    const getUserName = async () => {
      try {
        const storedData = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.username) {
            setUserName(parsedData.username);
          } else {
            setUserName("Guest");
          }
        } else {
          setUserName("Guest");
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setUserName("Guest");
      }
    };

    getUserName();
  }, []);

  return (
    <Container>
      <img src={Robot} alt="Welcome Robot" />
      <h1>
        Welcome, <span>{userName}!</span>
      </h1>
      <h3>Please select a chat to start messaging.</h3>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-direction: column;
  text-align: center;
  padding: 1rem;

  img {
    height: 20rem;
  }

  h1 {
    font-size: 2rem;
    margin: 1rem 0;
  }

  h3 {
    font-size: 1.2rem;
    font-weight: 400;
  }

  span {
    color: #4e0eff;
  }

  // Tablet responsiveness
  @media screen and (max-width: 1080px) {
    img {
      height: 15rem;
    }

    h1 {
      font-size: 1.6rem;
    }

    h3 {
      font-size: 1.1rem;
    }
  }

  // Mobile responsiveness
  @media screen and (max-width: 600px) {
    img {
      height: 12rem;
    }

    h1 {
      font-size: 1.4rem;
    }

    h3 {
      font-size: 1rem;
    }
  }
`;
