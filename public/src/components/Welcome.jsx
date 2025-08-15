import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Robot from "../assets/robot.gif";

export default function Welcome() {
  const [userName, setUserName] = useState("");
  
  useEffect(async () => {
    setUserName(
      await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      ).username
    );
  }, []);
  
  return (
    <Container>
      <div className="welcome-content">
        <img src={Robot} alt="Robot welcome" />
        <h1>
          Welcome, <span>{userName}!</span>
        </h1>
        <h3>Please select a chat to start messaging.</h3>
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #0d0d30;
  
  .welcome-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    max-width: 90%;
    
    @media (max-width: 768px) {
      padding: 1rem;
      max-width: 95%;
    }
    
    img {
      height: 20rem;
      margin-bottom: 2rem;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      
      @media (max-width: 768px) {
        height: 15rem;
        margin-bottom: 1.5rem;
      }
      
      @media (max-width: 480px) {
        height: 12rem;
        margin-bottom: 1rem;
      }
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
      
      @media (max-width: 768px) {
        font-size: 2rem;
        margin-bottom: 0.8rem;
      }
      
      @media (max-width: 480px) {
        font-size: 1.5rem;
        margin-bottom: 0.6rem;
      }
      
      span {
        color: #4e0eff;
        background: linear-gradient(45deg, #4e0eff, #997af0);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
    
    h3 {
      font-size: 1.2rem;
      color: #ffffff80;
      font-weight: 400;
      line-height: 1.5;
      
      @media (max-width: 768px) {
        font-size: 1rem;
      }
      
      @media (max-width: 480px) {
        font-size: 0.9rem;
      }
    }
  }
`;
