import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import VirtualStore from './VirtualStore.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <VirtualStore />
  </React.StrictMode>,
)
