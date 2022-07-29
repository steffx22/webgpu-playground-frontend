import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from "react-bootstrap/Form";
import { endpoint, userKey } from "../App";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Buttons.css'

async function registerUser(credentials: { email: string, username: string, password: string }) {
  const registerFormData = new FormData();

  registerFormData.append('email', credentials.email);
  registerFormData.append('username', credentials.username);
  registerFormData.append('password', credentials.password);
  return fetch(endpoint + 'userauthentication/register/', {
    method: 'POST',
    body: registerFormData,
  })
    .then(data => data.json(), () => "")
}

export const RegisterPopup = (): JSX.Element => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordR, setPasswordR] = useState("");
  const [username, setUsername] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const uid = localStorage.getItem(userKey);
  const display = uid === null || uid === "0" || uid === "undefined" ? "show" : "none";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== passwordR) {
      alert("Passwords don't match");
      return;
    }

    const data = await registerUser({
      email,
      username,
      password,
    })
    if (data.uid === undefined) {
      alert(data.error);
    } else {
      if (data !== "") 
      localStorage.setItem(userKey, data.uid)
      handleClose();
      window.location.reload();
    }  
  }
  
  return (
    <>
      <li className="nav-item nav-link" onClick={handleShow} style={{cursor:'pointer', display: display}}>
        Register
      </li>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sign Up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Enter email" onChange={ e => setEmail(e.target.value)}/>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" placeholder="Enter username" onChange={ e => setUsername(e.target.value)}/>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" onChange={ e => setPassword(e.target.value)}/>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control type="password" placeholder="Password" onChange={ e => setPasswordR(e.target.value)}/>
            </Form.Group>
            <Button className="button_center" variant="primary" type="submit" button-align="center">
              Sign Up
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}