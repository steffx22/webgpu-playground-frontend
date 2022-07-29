import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from "react-bootstrap/Form";
import { endpoint, userKey, userName, admin } from "../App";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Buttons.css'

async function loginUser(credentials: { username: string, password: string }) {
  const loginFormData = new FormData();

  loginFormData.append("username", credentials.username);
  loginFormData.append("password", credentials.password);
  return fetch(endpoint + 'userauthentication/login/', {
    method: 'POST',
    body: loginFormData
  })
    .then(data => data.json(), () => "")
}

export const LoginPopup = (): JSX.Element => { 

  const [show, setShow] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = await loginUser({
      username,
      password,
    }) 

    if (data.uid === undefined) {
      alert("Incorrect login, please try again");
    }
    else {
      localStorage.setItem(userKey, data.uid)
      localStorage.setItem(userName, username)
      localStorage.setItem(admin, data.admin)
      handleClose();
      window.location.reload();
    }
  }

  const uid = localStorage.getItem(userKey);
  const display = uid === null || uid === "0" || uid === "undefined" ? "show" : "none";

  return (
    <>
      <li className="nav-item nav-link" onClick={handleShow} style={{cursor:'pointer', display: display}}>
        Login
      </li>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" placeholder="Enter username" onChange={e => setUsername(e.target.value)}/>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" onChange={e => setPassword(e.target.value)}/>
            </Form.Group>
            <Button className="button_center" variant="primary" type="submit" button-align="center">
              Login
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}


