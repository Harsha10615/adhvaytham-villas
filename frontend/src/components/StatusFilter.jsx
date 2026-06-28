import React from 'react';

const StatusFilter = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'All Villas', dotClass: '' },
    { id: 'occupied', label: 'Occupied', dotClass: 'occupied' },
    { id: 'available', label: 'Available', dotClass: 'available' },
    { id: 'construction', label: 'Under Construction', dotClass: 'construction' },
    { id: 'sold', label: 'Sold', dotClass: 'sold' },
  ];

  return (
    <div className="filter-tabs-wrapper">
      {filters.map((filter) => (
        <button
          key={filter.id}
          className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.dotClass && (
            <span className={`status-dot ${filter.dotClass}`} style={{ marginRight: '8px' }}></span>
          )}
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default StatusFilter;
