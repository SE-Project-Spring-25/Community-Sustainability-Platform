import React from "react";
import "../styles/ContentSection.css";

const ContentSection = () => {
  return (
    <>
      <h2 className="section-title">Related Topics</h2>
      <ul>
        <li><a href="https://www.worcesterma.gov/parks">Green Spaces</a></li>
        <li><a href="https://green.worcesterma.gov/">Green Worcester Dashboard</a></li>
        <li><a href="https://www.masssave.com/">Mass Save</a></li>
        <li><a href="https://www.worcesterma.gov/trash-recycling">Trash & Recycling</a></li>
        <li><a href="https://www.worcesterma.gov/worcester-now-next">Worcester Now | Next</a></li>
      </ul>

      <h2 className="section-title">Know whats happening around</h2>
      <ul>
        <li>Book your appointment with our <a href="https://www.worcesterma.gov/sustainability-resilience/renewable-energy-efficiency/smart-energy-advice">Energy Advocate</a> today.</li>
        <li>Explore our StoryMaps - 
          <a href="https://storymaps.arcgis.com/stories/b58f74777bb845128a7dea236699e5fa">Miyawaki Forests</a>, 
          <a href="https://storymaps.arcgis.com/stories/b97eb38d94c74df7a306576f0ebcbe49">  CoolPockets </a> and 
          <a href="https://storymaps.arcgis.com/stories/e5e1107aab06429796e60663e0ca34ad"> Climate Resilience.</a></li>
        <li>Download our newly released Trash & Recycling Guide to learn about disposal options in Worcester - Trash & Recycling Guide | Spanish | Portuguese | Vietnamese</li>
        <li>Check out the Winter Climate Adaptation Plan developed by WPI students - Slides | Full Report | Summary</li>
        <li>Check out our latest Greenhouse Gas Inventory.</li>
      </ul>
      </>
  );
};

export default ContentSection;
