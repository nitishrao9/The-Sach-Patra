import { Link } from "react-router-dom";
import { Facebook, Youtube, Instagram, Rss } from "lucide-react";
import { XIcon } from "@/components/icons/XIcon";

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mt-12">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <div className="flex items-center space-x-2">
                <img
                  src="/sachpatra.jpg"
                  alt="The Sach Patra Logo"
                  className="w-10 h-10 rounded-lg object-cover"
                  loading="lazy"
                />
                <span className="font-bold text-2xl">
                  The Sach Patra
                </span>
              </div>
            </Link>

            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              भारत की सबसे विश्वसनीय समाचार वेबसाइट। हम आपको देश और दुनिया की सच्ची और निष्पक्ष खबरें प्रदान करते हैं।
            </p>

            <div className="mb-6">
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <span className="w-1 h-6 bg-red-500 mr-3"></span>
                सोशल मीडिया
              </h4>
              <div className="flex space-x-3">
                <Link
                  to="https://www.facebook.com/share/1a5dktsa1G/?mibextid=wwXIfr"
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook size={18} />
                </Link>
                <Link
                  to="https://x.com/thesachpatra?s=11"
                  className="w-10 h-10 bg-black hover:bg-gray-800 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <XIcon size={18} />
                </Link>
                <Link
                  to="https://www.youtube.com/@thesachpatra"
                  className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Youtube size={18} />
                </Link>
                <Link
                  to="https://www.instagram.com/thesachpatra_official?igsh=YmdraTM0NTBlaWtt&utm_source=qr"
                  className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={18} />
                </Link>
               
              </div>
            </div>
          </div>

          {/* News Categories */}
          <div>
            <h3 className="text-white font-semibold mb-6 flex items-center">
              <span className="w-1 h-6 bg-red-500 mr-3"></span>
              समाचार श्रेणियां
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/latest", label: "ताज़ा खबरें" },
                { to: "/national", label: "देश" },
                { to: "/international", label: "विदेश" },
                { to: "/politics", label: "राजनीति" },
                { to: "/sports", label: "खेल" },
                { to: "/entertainment", label: "मनोरंजन" },
                { to: "/technology", label: "तकनीक" },
                { to: "/business", label: "व्यापार" },
                { to: "/education", label: "शिक्षा" },
                { to: "/agriculture", label: "कृषि" }
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.to}
                    className="text-gray-300 hover:text-red-400 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3 group-hover:bg-red-400 transition-colors"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="text-white font-semibold mb-6 flex items-center">
              <span className="w-1 h-6 bg-red-500 mr-3"></span>
              महत्वपूर्ण लिंक
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/about", label: "हमारे बारे में" },
                { to: "/contact", label: "संपर्क करें" },
                // { to: "/team", label: "हमारी टीम" },
                // { to: "/advertise", label: "विज्ञापन दें" },
                { to: "/privacy-policy", label: "निजता नीति" },
                // { to: "/terms", label: "नियम और शर्तें" }
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.to}
                    className="text-gray-300 hover:text-red-400 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-3 group-hover:bg-red-400 transition-colors"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>


      {/* Footer Bottom */}
      <div className="border-t border-slate-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} <span className="text-white font-semibold">The Sach Patra</span>
              </p>
              <p className="text-white text-xs mt-1">
                खबर वही, जो सच कहे
              </p> 
            </div>

            <div className="flex items-center space-x-6 text-sm">
              {/* <Link
                to="/privacy-policy"
                className="text-gray-400 hover:text-red-400 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                to="/terms"
                className="text-gray-400 hover:text-red-400 transition-colors duration-200"
              >
                Terms of Service
              </Link> */}
              <span className="text-gray-600">•</span>
              <Link
                to="/contact"
                className="text-gray-400 hover:text-red-400 transition-colors duration-200"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}