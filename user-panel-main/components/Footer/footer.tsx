import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Get the current year dynamically
  return (
      <footer className="bg-[#ec742b]">
            <div className="container mx-auto ">
        <div className="text-sm w-full text-center text-white p-5 font-semibold">
          <p>© Copyright {currentYear}, GoIb.tech, All Rights Reserved</p>
        </div>
        </div>
      </footer>
  );
};

export default Footer;
