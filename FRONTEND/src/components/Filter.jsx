import React from 'react';

function Filter({ activeCodes, onFilterChange }) {
  const codes = ['C', 'T', 'A']; // You can expand this list based on your requirements
  return (
    <div className="filters">
      {codes.map(code => (
        <label key={code}>
          <input
            type="checkbox"
            checked={activeCodes.includes(code)}
            onChange={() => onFilterChange(code)}
          /> Code {code}
        </label>
      ))}
    </div>
  );
}

export default Filter;
