import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Search, X, Moon, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "@/providers/theme-provider";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { StateDropdown } from "@/components/ui/state-dropdown";
import { getAllCategories } from "@/utils/categoryMappings";
import { NewsTicker } from "@/components/ui/news-ticker";
import { getCustomCategories } from "@/services/categoryService";

export function Navbar() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as 'hi' | 'en';
  const navigate = useNavigate();

  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { theme, setTheme } = useTheme();

  // Load custom categories on component mount
  useEffect(() => {
    const loadCustomCategories = async () => {
      try {
        const categories = await getCustomCategories();
        setCustomCategories(categories);
      } catch (error) {
        console.error('Error loading custom categories:', error);
      }
    };

    loadCustomCategories();
  }, []);

  const categories = getAllCategories(currentLanguage, customCategories).map(cat => ({
    name: cat.label,
    href: `/${cat.urlSlug}`
  }));
  const date = new Date();
  const formattedDate = new Intl.DateTimeFormat('hi-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  // Handle search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setSearchTerm("");
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  return (
    <header className="border-b sticky top-0 bg-background z-40">
      <div className="w-full max-w-none flex justify-between items-center h-8 sm:h-10 text-xs border-b px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="text-xs sm:text-sm">{formattedDate}</div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-6 w-6 sm:h-8 sm:w-8"
          >
            {theme === "dark" ? <Sun size={14} className="sm:w-4 sm:h-4" /> : <Moon size={14} className="sm:w-4 sm:h-4" />}
          </Button>
        </div>
      </div>
      <div className="w-full max-w-none py-2 sm:py-3 px-2 sm:px-4 lg:px-6 xl:px-8 bg-red-700 text-white">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <img
              src="/sachptralogo.jpg"
              alt="The Sach Patra Logo"
              width="48"
              height="48"
              className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full object-cover"
              loading="eager"
            />
            <span className="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl text-white">The Sach Patra</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1 items-center">
            {!searchOpen ? (
              <>
                <LanguageSwitcher />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  className="h-9 w-9"
                >
                  <Search className="h-4 w-4" />
                </Button>
              
              </>
            ) : (
              <form onSubmit={handleSearch} className="flex items-center min-w-0 flex-1 max-w-md">
                <Input
                  type="search"
                  placeholder={`${t('search')}...`}
                  className="rounded-r-none text-sm"
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  autoFocus
                />
                <Button type="submit" className="rounded-l-none text-sm px-3">{t('search')}</Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchTerm("");
                  }}
                  className="h-9 w-9 ml-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-1 sm:space-x-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {categories.map((category) => {
                    // Special handling for National category with state dropdown
                    if (category.href === '/national') {
                      return (
                        <StateDropdown
                          key={category.name}
                          variant="mobile"
                          className="justify-start"
                        />
                      );
                    }

                    return (
                      <Link
                        key={category.name}
                        to={category.href}
                        className="text-base sm:text-lg hover:text-primary transition-colors py-2 px-1 rounded-md hover:bg-muted"
                      >
                        {category.name}
                      </Link>
                    );
                  })}
                  <div className="border-t pt-4 mt-4 space-y-4">
                    {/* <Link to="/subscribe" className="text-base sm:text-lg hover:text-primary py-2 px-1 rounded-md hover:bg-muted block">
                      सदस्यता लें
                    </Link>
                    <Link to="/live-tv" className="text-base sm:text-lg hover:text-primary py-2 px-1 rounded-md hover:bg-muted block sm:hidden">
                      लाइव टीवी
                    </Link>
                    <Link to="/about" className="text-base sm:text-lg hover:text-primary py-2 px-1 rounded-md hover:bg-muted block md:hidden">
                      हमारे बारे में
                    </Link>
                    <Link to="/contact" className="text-base sm:text-lg hover:text-primary py-2 px-1 rounded-md hover:bg-muted block lg:hidden">
                      संपर्क करें
                    </Link> */}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* News Ticker */}
      <NewsTicker className="hidden md:block" />

      {/* Category Navigation */}
      <div className="border-t hidden md:block">
        <div className="w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8">
          <nav className="flex items-center space-x-4 lg:space-x-6 overflow-x-auto whitespace-nowrap py-3 scrollbar-hide">
            {categories.map((category) => {
              // Special handling for National category with state dropdown
              if (category.href === '/national') {
                return (
                  <StateDropdown
                    key={category.name}
                    variant="navbar"
                  />
                );
              }

              return (
                <Link
                  key={category.name}
                  to={category.href}
                  className="text-xs sm:text-sm font-medium hover:text-primary transition-colors flex-shrink-0"
                >
                  {category.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile News Ticker */}
      <NewsTicker className="md:hidden" />

      {/* Mobile Search */}
      {searchOpen && (
        <div className="md:hidden w-full max-w-none py-3 border-t px-2 sm:px-4 lg:px-6 xl:px-8">
          <form onSubmit={handleSearch} className="flex items-center">
            <Input
              type="search"
              placeholder={`${t('search')}...`}
              className="rounded-r-none text-sm"
              value={searchTerm}
              onChange={handleSearchInputChange}
              autoFocus
            />
            <Button type="submit" className="rounded-l-none text-sm px-3">{t('search')}</Button>
          </form>
        </div>
      )}
    </header>
  );
}