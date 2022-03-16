import React from 'react';
import ReactDOM from 'react-dom';
// @ts-ignore
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import './index.css';
import App from './App';
import Login from './Login';


ReactDOM.render(

  <Router>
    <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path='/room' element={<App/>}/>
    </Routes>
  </Router>
  ,
  document.getElementById('root')
);


