// LoadingBar.js
import React from 'react';
import './LoadingBar.css'; // Add styles for the loading bar

const LoadingBar = ({ progress }) => {
  return (
    <div className="loading-bar-overlay">
      <div className="loading-bar-container">
        <div className="loading-bar" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default LoadingBar;
