import React, { useState, useRef, useEffect } from 'react';

const Dropdown = ({ 
  trigger, 
  children, 
  position = 'bottom-right',
  className = '',
  closeOnItemClick = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const positions = {
    'bottom-right': 'right-0 mt-2 top-full',
    'bottom-left': 'left-0 mt-2 top-full',
    'top-right': 'right-0 bottom-full mb-2',
    'top-left': 'left-0 bottom-full mb-2'
  };

  const handleItemClick = () => {
    if (closeOnItemClick) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div 
            className={`
              absolute 
              ${positions[position]} 
              bg-white 
              rounded-lg 
              shadow-xl 
              overflow-hidden 
              z-50 
              border 
              border-gray-100 
              min-w-[200px]
              py-1
              ${className}
            `}
            style={{
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}
            onClick={handleItemClick}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
};

export default Dropdown;