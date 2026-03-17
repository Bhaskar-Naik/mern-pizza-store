import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar onCollapse={setCollapsed} />
      {/* On mobile, no left margin since sidebar is an overlay */}
      <div style={{
        marginLeft: isMobile ? '0' : (collapsed ? '64px' : '220px'),
        flex: 1,
        background: '#f5f5f5',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        width: '100%',
      }}>
        {/* Mobile top spacer for hamburger button */}
        {isMobile && <div style={{ height: '56px' }} />}
        {children}
      </div>
    </div>
  );
};

export default Layout;