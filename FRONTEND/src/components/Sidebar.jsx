import React, { useState, useEffect } from "react";
import Draggable from "react-draggable";


const Sidebar = ({ selectedBranch }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [glbUrl, setGlbUrl] = useState("");

  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (selectedBranch) {
      fetch(`${baseUrl}/api/get-signed-url/${selectedBranch.code}/`)
        .then((response) => response.json())
        .then((data) => {
          setGlbUrl(data.url);
        })
        .catch((error) => console.error('Error fetching the URL:', error));
    }
  }, [selectedBranch]);

  if (!selectedBranch) {
    return <div className="sidebar">Select a branch to see details.</div>;
  }

  const handleMouseDown = () => {
    setDisabled(true);
  };

  const handleMouseUp = () => {
    if (window.getSelection().toString()) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  };

  return (
    <Draggable handle=".handle">
      <div
        className={`sidebar ${isMinimized ? "minimized" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div
          className="handle"
          style={{ cursor: "move", backgroundColor: "transparent", padding: "10px", justifyContent:"center", textAlign:"center"}}
        >
          ...
        </div>
        <button onClick={() => setIsMinimized(!isMinimized)}>
          {isMinimized ? "Expand" : "Minimize"}
        </button>
        <button
          type="button"
          onClick={(e)=>{
            e.preventDefault();
            window.location.href=`/scene/${selectedBranch.code}`
          }}
        >
          Virtual Store
        </button>

        {!isMinimized && (
          <>
            <h2>{selectedBranch.code}</h2>
            <h3>{selectedBranch.branchCity}</h3>
            <div dangerouslySetInnerHTML={{ __html: selectedBranch.details }} />
            <div dangerouslySetInnerHTML={{ __html: selectedBranch.contact }} />
          </>
        )}
      </div>
    </Draggable>
  );
};

export default Sidebar;
