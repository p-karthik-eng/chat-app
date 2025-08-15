import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/logo.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerRoute } from "../utils/APIRoutes";

export default function Register() {
  const navigate = useNavigate();
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate("/");
    }
  }, []);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleValidation = () => {
    const { password, confirmPassword, username, email } = values;
    if (password !== confirmPassword) {
      toast.error(
        "Password and confirm password should be same.",
        toastOptions
      );
      return false;
    } else if (username.length < 3) {
      toast.error(
        "Username should be greater than 3 characters.",
        toastOptions
      );
      return false;
    } else if (password.length < 8) {
      toast.error(
        "Password should be equal or greater than 8 characters.",
        toastOptions
      );
      return false;
    } else if (email === "") {
      toast.error("Email is required.", toastOptions);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      const { email, username, password } = values;
      const { data } = await axios.post(registerRoute, {
        username,
        email,
        password,
      });

      if (data.status === false) {
        toast.error(data.msg, toastOptions);
      }
      if (data.status === true) {
        localStorage.setItem(
          process.env.REACT_APP_LOCALHOST_KEY,
          JSON.stringify(data.user)
        );
        navigate("/");
      }
    }
  };

  return (
    <>
      <FormContainer>
        <form action="" onSubmit={(event) => handleSubmit(event)}>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h1>snappy</h1>
          </div>
          <input
            type="text"
            placeholder="Username"
            name="username"
            onChange={(e) => handleChange(e)}
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            onChange={(e) => handleChange(e)}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={(e) => handleChange(e)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            onChange={(e) => handleChange(e)}
          />
          <button type="submit">Create User</button>
          <span>
            Already have an account ? <Link to="/login">Login.</Link>
          </span>
        </form>
      </FormContainer>
      <ToastContainer />
    </>
  );
}

const FormContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  padding: 1rem;
  
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1rem;
    
    img {
      height: 5rem;
      @media (max-width: 768px) {
        height: 4rem;
      }
      @media (max-width: 480px) {
        height: 3.5rem;
      }
    }
    
    h1 {
      color: white;
      text-transform: uppercase;
      font-size: 2.5rem;
      font-weight: 700;
      
      @media (max-width: 768px) {
        font-size: 2rem;
      }
      @media (max-width: 480px) {
        font-size: 1.8rem;
      }
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background-color: #00000076;
    border-radius: 2rem;
    padding: 3rem 5rem;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    
    @media (max-width: 768px) {
      padding: 2.5rem 2rem;
      gap: 1.5rem;
      border-radius: 1.5rem;
    }
    
    @media (max-width: 480px) {
      padding: 2rem 1.5rem;
      gap: 1.2rem;
      border-radius: 1rem;
    }
  }
  
  input {
    background-color: transparent;
    padding: 1rem;
    border: 0.1rem solid #4e0eff;
    border-radius: 0.4rem;
    color: white;
    width: 100%;
    font-size: 1rem;
    transition: all 0.3s ease;
    
    @media (max-width: 768px) {
      padding: 0.9rem;
      font-size: 0.95rem;
    }
    
    @media (max-width: 480px) {
      padding: 0.8rem;
      font-size: 0.9rem;
    }
    
    &:focus {
      border: 0.1rem solid #997af0;
      outline: none;
      box-shadow: 0 0 10px rgba(78, 14, 255, 0.3);
    }
    
    &::placeholder {
      color: #ffffff80;
    }
  }
  
  button {
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
    
    @media (max-width: 768px) {
      padding: 0.9rem 1.8rem;
      font-size: 0.95rem;
      min-height: 45px;
    }
    
    @media (max-width: 480px) {
      padding: 0.8rem 1.5rem;
      font-size: 0.9rem;
      min-height: 40px;
    }
    
    &:hover {
      background-color: #997af0;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(78, 14, 255, 0.4);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  span {
    color: white;
    text-transform: uppercase;
    text-align: center;
    font-size: 0.9rem;
    line-height: 1.5;
    
    @media (max-width: 768px) {
      font-size: 0.85rem;
    }
    @media (max-width: 480px) {
      font-size: 0.8rem;
    }
    
    a {
      color: #4e0eff;
      text-decoration: none;
      font-weight: bold;
      transition: color 0.3s ease;
      
      &:hover {
        color: #997af0;
        text-decoration: underline;
      }
    }
  }
`;
