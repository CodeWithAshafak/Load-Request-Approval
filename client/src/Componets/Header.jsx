// import React, { useState } from "react";

// const Header = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleMenu = () => setIsOpen(!isOpen);

//   return (
//     <header className="bg-[#e41b13] text-white shadow-md">
//       <div className="container mx-auto flex items-center justify-between px-4 py-3">
        
//         {/* Logo */}
//         <div className="flex items-center">
//           <img
//             src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg"
//             alt="Coca-Cola Logo"
//             className="h-10 w-auto"
//           />
//         </div>

//         {/* Desktop Navigation */}
//         <nav className="hidden md:flex space-x-6 font-semibold">
//           <a href="#" className="hover:underline">Home</a>
//           <a href="#" className="hover:underline">Products</a>
//           <a href="#" className="hover:underline">About Us</a>
//           <a href="#" className="hover:underline">Contact</a>
//         </nav>

//         {/* Mobile Menu Button */}
//         <button
//           className="md:hidden flex flex-col justify-center items-center w-8 h-8"
//           onClick={toggleMenu}
//         >
//           <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${isOpen ? "rotate-45 translate-y-1.5" : ""}`}></span>
//           <span className={`block w-6 h-0.5 bg-white my-1 transition-opacity duration-300 ${isOpen ? "opacity-0" : ""}`}></span>
//           <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${isOpen ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
//         </button>
//       </div>

//       {/* Mobile Dropdown */}
//       {isOpen && (
//         <div className="md:hidden bg-[#e41b13] px-4 pb-4 space-y-2 font-semibold">
//           <a href="#" className="block hover:underline">Home</a>
//           <a href="#" className="block hover:underline">Products</a>
//           <a href="#" className="block hover:underline">About Us</a>
//           <a href="#" className="block hover:underline">Contact</a>
//         </div>
//       )}
//     </header>
//   );
// };

// export default Header;
