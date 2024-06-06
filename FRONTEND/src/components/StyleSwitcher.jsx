import React from "react";

function StyleSwitcher({ onChange }) {
  // Map styles
  const styles = [
    { title: "Streets", url: "mapbox://styles/mapbox/streets-v11" },
    { title: "Satellite", url: "mapbox://styles/mapbox/satellite-v9" },
    { title: "Dark", url: "mapbox://styles/mapbox/dark-v11" },
    { title: "Light", url: "mapbox://styles/mapbox/light-v11" },
    // Add more styles as needed
  ];
  return (
    <div className="styleSwitch">
      <select onChange={(e) => onChange(e.target.value)} defaultValue="">
        <option value="" disabled>
          Change Style
        </option>
        {styles.map((style) => (
          <option key={style.url} value={style.url}>
            {style.title}
          </option>
        ))}
      </select>
    </div>
  );
}

export default StyleSwitcher;
