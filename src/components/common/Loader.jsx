import spinner from "../../assets/spinner.svg";
import '../../styles/Loading.css';
import React from "react";

export default function Loader({show, message}) {
    return (
        show &&
        <div className="text-center text-lg text-indigo-600 bg-white p-8">
            <span>{message}...</span>
            <div className="spinner">
                <img src={spinner} aria-hidden="true" alt="spinner"/>
            </div>
        </div>
    )
}