import mapboxgl from 'mapbox-gl';
import React, { useState, useEffect } from 'react';

const SearchAddress = ({ onSearch }) => {
    const [address, setAddress] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    // Function to fetch autocomplete suggestions from Mapbox
    const fetchSuggestions = async (input) => {
        if (!input) {
            setSuggestions([]);
            return;
        }
        const accessToken = mapboxgl.accessToken; // Ensure you have defined your accessToken
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input)}.json?access_token=${accessToken}&autocomplete=true&limit=5&country=CA`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            setSuggestions(data.features);
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
            setSuggestions([]);
        }
    };

    // Handle input change to update address and fetch suggestions
    const handleInputChange = (event) => {
        const value = event.target.value;
        setAddress(value);
        fetchSuggestions(value);
    };

    // Handle selecting a suggestion
    const handleSelectSuggestion = (suggestion) => {
        setAddress(suggestion.place_name);
        setSuggestions([]);
        onSearch(suggestion.place_name);
    };

    return (
        <div className='search'>
            <input
                type="text"
                placeholder="Enter address"
                value={address}
                onChange={handleInputChange}
            />
            <button onClick={() => onSearch(address)}>Find Nearest Branch</button>
            {suggestions.length > 0 && (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {suggestions.map((suggestion) => (
                        <li key={suggestion.id} onClick={() => handleSelectSuggestion(suggestion)} style={{ cursor: 'pointer' }}>
                            {suggestion.place_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchAddress;
