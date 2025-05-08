import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/logo.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginRoute } from "../utils/APIRoutes";

export default function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", password: "" });
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    if (localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate("/");
    }
  }, []);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const validateForm = () => {
    const { username, password } = values;
    if (username === "" || password === "") {
      toast.error("Email and Password is required.", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      const { username, password } = values;
      const { data } = await axios.post(loginRoute, { username, password });
      if (data.status === false) {
        toast.error(data.msg, toastOptions);
      } else {
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
        <form onSubmit={handleSubmit}>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h1>snappy</h1>
          </div>
          <input
            type="text"
            placeholder="Username"
            name="username"
            onChange={handleChange}
            min="3"
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={handleChange}
          />
          <button type="submit">Log In</button>
          <span>
            Don't have an account? <Link to="/register">Create One.</Link>
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
  align-items: center;
  background-color: #131324;
  padding: 1rem;

  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;

    img {
      height: 3.5rem;
    }
    h1 {
      color: white;
      text-transform: uppercase;
      font-size: 1.8rem;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background-color: #00000076;
    border-radius: 2rem;
    padding: 2.5rem;
    width: 100%;
    max-width: 400px;
  }

  input {
    background-color: transparent;
    padding: 0.8rem 1rem;
    border: 0.1rem solid #4e0eff;
    border-radius: 0.4rem;
    color: white;
    font-size: 1rem;
    width: 100%;
    &:focus {
      border: 0.1rem solid #997af0;
      outline: none;
    }
  }

  button {
    background-color: #4e0eff;
    color: white;
    padding: 0.8rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    transition: background-color 0.3s ease-in-out;
    &:hover {
      background-color: #3c0eff;
    }
  }

  span {
    color: white;
    text-transform: uppercase;
    font-size: 0.9rem;
    text-align: center;
    a {
      color: #4e0eff;
      text-decoration: none;
      font-weight: bold;
      margin-left: 0.3rem;
    }
  }

  // Responsive design
  @media screen and (max-width: 480px) {
    .brand {
      flex-direction: column;
      img {
        height: 3rem;
      }
      h1 {
        font-size: 1.5rem;
      }
    }

    form {
      padding: 2rem;
      gap: 1.2rem;
    }

    input,
    button {
      font-size: 0.9rem;
      padding: 0.7rem;
    }

    span {
      font-size: 0.8rem;
    }
  }
`;
