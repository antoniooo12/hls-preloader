import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {AppV3} from "./AppV3.tsx";
import {AppV4} from "./AppV4.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <AppV4 />
  </>,
)
