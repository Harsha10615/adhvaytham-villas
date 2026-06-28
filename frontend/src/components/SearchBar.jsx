import React from 'react';

const SearchBar = ({ value, onChange, placeholder = "Search Villa (e.g. 045, 112)..." }) => {
  return (
    <div className="search-box">
      <i className="fas fa-search"></i>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchBar;
