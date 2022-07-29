import { LoginPopup } from './LoginPopup';
import { RegisterPopup } from './RegisterPopup';
import { userKey, admin } from "../App";
import { v4 as uuid_v4 } from "uuid";
import { useState } from 'react';
import { Link } from 'react-router-dom'

export const defaultSearchTag : string = "";

export function TopNavigationBar() {
    const uid = localStorage.getItem(userKey);
    const adminS = localStorage.getItem(admin)
    const display = uid === null || uid === "0" || uid === "undefined" ? "none" : "show";
    const isAdmin = adminS === "true" || adminS === "True";
    const [tag, setTag] = useState(defaultSearchTag);


    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark" style={{ height: "10vh" }}>
            <div className="container-fluid">
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <a className="navbar-brand" href="/"> WebGPU Playground </a>
                <div className="collapse navbar-collapse" id="navbarTogglerDemo03">
                    <form className="d-flex">
                        <input id="search-tag" className="form-control me-2" type="text" placeholder="Search by tag" aria-label="Search" onChange={ (e) => {setTag(e.target.value)}}/>
                        <Link to={'/?tag=' + tag} className="btn btn-outline-success" onClick={() => window.location.replace('/?tag=' + tag)}> Search </Link>
                    </form>
                </div>
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item" key="gallery">
                        <a className="nav-link active top-bar-item" aria-current="page" href="/"> Gallery </a>
                    </li>
                    <li className="nav-item" key="shader">
                        <a className="nav-link active top-bar-item" aria-current="page" href={'/editshader/false/' + uid + '/' + uuid_v4()}> New shader</a>
                    </li>
                    {
                        isAdmin &&
                        <li className="nav-item" key="reported">
                            <a className="nav-link active top-bar-item" aria-current="page" href={'/reportedcreations'}> Reported Creations</a>
                        </li>
                    }
                    <LoginPopup/>
                    <RegisterPopup/>
                    <li className="nav-item" key="my-account" style={{display: display}}>
                        <a className="nav-link active top-bar-item" aria-current="page" href="/myaccount"> My account </a>
                    </li>
                    <li className="nav-item" key="log-out">
                        <div
                            className="nav-link active top-bar-item"
                            onClick={() => {localStorage.setItem(userKey, "0"); localStorage.setItem(admin, "false"); window.location.reload(); }}
                            style={{ display: display, cursor: "pointer" }}>
                            Log out
                        </div>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default TopNavigationBar;