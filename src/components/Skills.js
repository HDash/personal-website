'use client'; // Add this for Next.js client components

import React, { useState } from 'react';
import { basicData } from "../data/basic.js";
import Subheading from "./helpers/Subheading.js";

export default function Skills() {
  const { skills } = basicData;
  const [hoveredSkill, setHoveredSkill] = useState(null);

  return (
    <div className="relative">
      <Subheading text="Key Skills" />
      <ul className="list-disc list-inside">
        {Object.entries(skills).map(([skill, subSkills], index) => (
          <div 
            key={index} 
            className="relative ml-1 my-1"
            onMouseEnter={() => setHoveredSkill(skill)}
            onMouseLeave={() => setHoveredSkill(null)}
          >
            <li className="opacity-90 cursor-pointer hover:opacity-50">
              <span>{skill}</span>
              <span className="text-xs opacity-30"> →</span>
              {subSkills.length > 0 && (
                <span className="ml-1 text-xs text-gray-400"></span>
              )}
            </li>
            
            {hoveredSkill === skill && subSkills.length > 0 && (
              <div className="absolute ml-2 left-30 sm:left-70 top-0 shadow-md rounded-xl p-3 min-w-48 z-10 border dark:bg-gray-950 bg-teal-50 dark:border-gray-300 border-gray-500">
                <p className="font-medium mb-1">{skill}</p>
                {subSkills.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {subSkills.map((subSkill, subIndex) => (
                      <li key={subIndex} className="text-sm ml-2">{subSkill}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">No specific skills listed</p>
                )}
              </div>
            )}
          </div>
        ))}
      </ul>
    </div>
  );
}