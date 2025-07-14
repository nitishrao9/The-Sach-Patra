import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Facebook, Twitter, Youtube, Instagram, Rss } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted pt-8 sm:pt-12 mt-8 sm:mt-12">
      <div className="container px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="font-bold text-xl sm:text-2xl text-primary">The Sach<span className="text-black dark:text-white">Patra</span></span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              The Sach Patra आपको देता है देश और दुनिया की ताज़ा खबरें, विश्लेषण और राय।
            </p>
            <div className="flex space-x-4">
              <Link to="https://www.facebook.com/share/1a5dktsa1G/?mibextid=wwXIfr" className="hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
                <Facebook size={20} />
              </Link>
              <Link to="https://twitter.com" className="hover:text-primary transition-colors">
                <Twitter size={20} />
              </Link>
              <Link to="https://www.youtube.com/@thesachpatra" className="hover:text-primary" target="_blank" rel="noopener noreferrer">
                <Youtube size={20} />
              </Link>
              <Link to="https://www.instagram.com/thesachpatra_official?igsh=YmdraTM0NTBlaWtt&utm_source=qr" className="hover:text-primary" target="_blank" rel="noopener noreferrer">
                <Instagram size={20} />
              </Link>
              <Link to="/rss" className="hover:text-primary">
                <Rss size={20} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">श्रेणियां</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/latest" className="text-sm hover:text-primary">ताज़ा खबरें</Link>
              </li>
              <li>
                <Link to="/national" className="text-sm hover:text-primary">देश</Link>
              </li>
              <li>
                <Link to="/international" className="text-sm hover:text-primary">विदेश</Link>
              </li>
              <li>
                <Link to="/politics" className="text-sm hover:text-primary">राजनीति</Link>
              </li>
              <li>
                <Link to="/sports" className="text-sm hover:text-primary">खेल</Link>
              </li>
              <li>
                <Link to="/entertainment" className="text-sm hover:text-primary">मनोरंजन</Link>
              </li>
              <li>
                <Link to="/technology" className="text-sm hover:text-primary">तकनीक</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">अन्य लिंक</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/live-tv" className="text-sm hover:text-primary">लाइव टीवी</Link>
              </li>
              <li>
                <Link to="/podcasts" className="text-sm hover:text-primary">पॉडकास्ट</Link>
              </li>
              <li>
                <Link to="/photo-gallery" className="text-sm hover:text-primary">फोटो गैलरी</Link>
              </li>
              <li>
                <Link to="/videos" className="text-sm hover:text-primary">वीडियो</Link>
              </li>
              <li>
                <Link to="/archives" className="text-sm hover:text-primary">आर्काइव</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">संपर्क और सूचना</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm hover:text-primary">हमारे बारे में</Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-primary">संपर्क करें</Link>
              </li>
              <li>
                <Link to="/team" className="text-sm hover:text-primary">हमारी टीम</Link>
              </li>
              <li>
                <Link to="/advertise" className="text-sm hover:text-primary">विज्ञापन दें</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm hover:text-primary">निजता नीति</Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm hover:text-primary">नियम और शर्तें</Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center pb-6 sm:pb-8 space-y-2 sm:space-y-0">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} समाचार हिंदी। सर्वाधिकार सुरक्षित।
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
            हमारे उपयोग की शर्तों और निजता नीति का पालन करना आवश्यक है।
          </p>
        </div>
      </div>
    </footer>
  );
}