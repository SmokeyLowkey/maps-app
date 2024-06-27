import React from 'react';
import Filter from './Filter';

function NavBar({ activeCodes, onFilterChange, filteredMarkers, onBranchSelect }) {
  // Sort the filteredMarkers array alphabetically by branchCity
  const sortedMarkers = [...filteredMarkers].sort((a, b) => a.branchCity.localeCompare(b.branchCity));
  return (
    <div className="navbar">
      <Filter activeCodes={activeCodes} onFilterChange={onFilterChange} />
      <select 
      onChange={e => onBranchSelect(e.target.value)} 
      style={{ width: '100%', padding: '5px' }}
      disabled={activeCodes.length === 0}  // Disable dropdown if no codes are active
      >
        <option value="">Select a Branch...</option>
        {sortedMarkers.map(marker => (
          <option key={marker.code} value={marker.code}>{marker.branchCity} - {marker.code}</option> // Adjust if your data has different properties
        ))}
      </select>
      {activeCodes.length === 0 && <p style={{ color: 'red', fontSize:'12px' }}>Please select a filter to enable branch selection.</p>}
    </div>
  );
}

export default NavBar;
