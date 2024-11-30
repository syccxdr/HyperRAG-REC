import React from "react";
import "./NavigationBar.css";

const NavigationBar = () => {
  return (
    <div className="nav-bar">
      <div className="logo">Shopping Assistant</div>
      <div className="menu">
        <button className="menu-btn">Home</button>
        <button className="menu-btn">Settings</button>
      </div>
    </div>
  );
};

export default NavigationBar;
