import * as React from 'react';
import SideBar from '../Sidebar';
import HeaderBar from './headerbar';
import NavBar from './navbar';
import './style.css';

export const Header = () => (
  <div>
    <SideBar />
    <HeaderBar />
    <NavBar />
  </div>
);

export default Header;
