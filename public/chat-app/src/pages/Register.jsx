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
      toast.error("Password and confirm password should be same.", toastOptions);
      return false;
    } else if (username.length < 3) {
      toast.error("Username should be greater than 3 characters.", toastOptions);
      return false;
    } else if (password.length < 8) {
      toast.error("Password should be equal or greater than 8 characters.", toastOptions);
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
        <form onSubmit={(event) => handleSubmit(event)}>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h1>snappy</h1>
          </div>
          <input
            type="text"
            placeholder="Username"
            name="username"
            onChange={handleChange}
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            onChange={handleChange}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={handleChange}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            onChange={handleChange}
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

    img {
      height: 4rem;
    }

    h1 {
      color: white;
      text-transform: uppercase;
      font-size: 2rem;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background-color: #00000076;
    border-radius: 2rem;
    padding: 3rem 4rem;
    width: 100%;
    max-width: 450px;
  }

  input {
    background-color: transparent;
    padding: 1rem;
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
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;

    &:hover {
      background-color: #4e0eff;
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
    }
  }

  @media screen and (max-width: 480px) {
    .brand {
      flex-direction: column;
      img {
        height: 3.5rem;
      }

      h1 {
        font-size: 1.5rem;
      }
    }

    form {
      padding: 2rem;
      gap: 1.2rem;
    }

    input {
      font-size: 0.9rem;
    }

    button {
      font-size: 0.9rem;
    }

    span {
      font-size: 0.8rem;
    }
  }
`;
