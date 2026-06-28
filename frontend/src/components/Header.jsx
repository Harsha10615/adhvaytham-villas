import React from 'react';
import Navbar from './Navbar';

const Header = ({ onToggleSidebar }) => {
  return (
    <>
      <Navbar onToggleSidebar={onToggleSidebar} />
    </>
  );
};

export default Header;
