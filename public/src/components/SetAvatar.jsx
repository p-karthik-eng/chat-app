import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import loader from "../assets/loader.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utils/APIRoutes";
import multiavatar from "@multiavatar/multiavatar/esm";

export default function SetAvatar() {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(null);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
        if (!user) {
          navigate("/login");
          return;
        }
        
        const userData = JSON.parse(user);
        setCurrentUser(userData);
        
        // If user already has an avatar, redirect to chat
        if (userData.isAvatarImageSet) {
          navigate("/");
          return;
        }
      } catch (error) {
        console.error("Error checking user:", error);
        navigate("/login");
      }
    };
    
    checkUser();
  }, [navigate]);

  const generateRandomName = () => Math.random().toString(36).substring(2, 10);

  useEffect(() => {
    const generateAvatars = () => {
      const data = [];
      for (let i = 0; i < 4; i++) {
        const randomName = generateRandomName();
        const svgCode = multiavatar(randomName);
        const encoded = btoa(unescape(encodeURIComponent(svgCode)));
        data.push(encoded);
      }
      setAvatars(data);
      setIsLoading(false);
    };

    generateAvatars();
  }, []);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
      return;
    }

    if (!currentUser) {
      toast.error("User not found. Please login again.", toastOptions);
      navigate("/login");
      return;
    }

    try {
      const { data } = await axios.post(`${setAvatarRoute}/${currentUser._id}`, {
        image: avatars[selectedAvatar],
      });

      if (data.isSet) {
        // Update local user data
        const updatedUser = {
          ...currentUser,
          isAvatarImageSet: true,
          avatarImage: data.image,
        };
        
        localStorage.setItem(
          process.env.REACT_APP_LOCALHOST_KEY,
          JSON.stringify(updatedUser)
        );
        
        toast.success("Avatar set successfully!", toastOptions);
        
        // Navigate to chat after a short delay
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        toast.error("Error setting avatar. Please try again.", toastOptions);
      }
    } catch (error) {
      console.error("Error setting avatar:", error);
      toast.error("Error setting avatar. Please try again.", toastOptions);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <img src={loader} alt="loader" className="loader" />
      </Container>
    );
  }

  return (
    <Container>
      <div className="title-container">
        <h1>Pick an Avatar as your profile picture</h1>
      </div>
      <div className="avatars">
        {avatars.map((avatar, index) => (
          <div
            key={index}
            className={`avatar ${
              selectedAvatar === index ? "selected" : ""
            }`}
            onClick={() => setSelectedAvatar(index)}
          >
            <img
              src={`data:image/svg+xml;base64,${avatar}`}
              alt={`avatar-${index}`}
            />
          </div>
        ))}
      </div>
      <button 
        onClick={setProfilePicture} 
        className="submit-btn"
        disabled={selectedAvatar === undefined}
      >
        Set as Profile Picture
      </button>
      <ToastContainer />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 3rem;
  background-color: #131324;
  height: 100vh;
  width: 100vw;
  padding: 2rem;

  .loader {
    max-inline-size: 100%;
  }

  .title-container {
    text-align: center;
    
    h1 {
      color: white;
      font-size: 2rem;
      font-weight: 600;
      
      @media (max-width: 768px) {
        font-size: 1.5rem;
      }
      
      @media (max-width: 480px) {
        font-size: 1.2rem;
      }
    }
  }

  .avatars {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;

    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.5s ease-in-out;
      cursor: pointer;

      img {
        height: 6rem;
        transition: 0.5s ease-in-out;
        
        @media (max-width: 768px) {
          height: 5rem;
        }
        
        @media (max-width: 480px) {
          height: 4rem;
        }
      }

      &:hover {
        transform: scale(1.1);
        border-color: #4e0eff80;
      }
    }

    .selected {
      border: 0.4rem solid #4e0eff;
      transform: scale(1.05);
    }
  }

  .submit-btn {
    background-color: #4e0eff;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    transition: all 0.3s ease;
    min-height: 50px;
    min-width: 200px;
    
    @media (max-width: 768px) {
      padding: 0.9rem 1.8rem;
      font-size: 0.95rem;
      min-width: 180px;
    }
    
    @media (max-width: 480px) {
      padding: 0.8rem 1.5rem;
      font-size: 0.9rem;
      min-width: 160px;
    }

    &:hover:not(:disabled) {
      background-color: #3c0edc;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(78, 14, 255, 0.4);
    }
    
    &:disabled {
      background-color: #666;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }
`;
