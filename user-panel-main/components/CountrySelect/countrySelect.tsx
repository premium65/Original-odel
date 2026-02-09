import React, { useState } from "react";
import { getCountries, getCountryCallingCode } from "react-phone-number-input/input";
import "flag-icons/css/flag-icons.min.css";

const CountrySelect = ({ value, onChange }:any) => {
  const [isOpen, setIsOpen] = useState(false);
  const countries = getCountries();

  const handleCountrySelect = (country:any) => {
    onChange(country);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="block w-full text-sm text-left appearance-none rounded-md border text-black border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm sm:text-sm focus:border-indigo-500 focus:ring-0"
      >
        {value ? (
          <>
            <span className={`fi fi-${value.toLowerCase()} mr-2`} /> {/* Flag */}
            +{getCountryCallingCode(value)}
          </>
        ) : (
          "Select Country"
        )}
      </button>
      
      {isOpen && (
        <ul className="absolute z-10 mt-2 max-h-60 w-full overflow-auto bg-white border border-gray-300 rounded-md shadow-lg">
          {countries.map((country) => (
            <li
              key={country}
              onClick={() => handleCountrySelect(country)}
              className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
            >
              <span className={`fi fi-${country.toLowerCase()} mr-2 text-sm`} /> {/* Flag */}
              <span className="text-sm">{country} +{getCountryCallingCode(country)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CountrySelect;
