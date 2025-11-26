import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/index.css'
import {BrowserRouter} from "react-router-dom";
import AppContext from "./components/AppContext.jsx";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AppContext>
                <App/>
            </AppContext>
        </BrowserRouter>
    </React.StrictMode>
)