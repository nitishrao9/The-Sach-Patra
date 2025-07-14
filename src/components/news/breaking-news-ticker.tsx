import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, AlertTriangle } from "lucide-react";

interface BreakingNewsItem {
  id: string;
  title: string;
}

interface BreakingNewsTickerProps {
  items: BreakingNewsItem[];
}

export function BreakingNewsTicker({ items }: BreakingNewsTickerProps) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    
    const intervalId = setInterval(() => {
      setCurrentItemIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 6000);
    
    return () => clearInterval(intervalId);
  }, [items.length]);

  if (!items.length) return null;

  const currentItem = items[currentItemIndex];

  return (
    <div className="bg-black text-white h-[52px] sm:h-[60px] overflow-hidden mt-2 flex items-center">
      <div className="container flex items-center px-4 sm:px-6 h-full">
        <div className="flex items-center font-bold mr-2 sm:mr-4 flex-shrink-0">
          <AlertTriangle className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-xs sm:text-sm">ब्रेकिंग न्यूज़</span>
        </div>
        <div className="flex-1 overflow-hidden relative min-w-0">
          <div className="whitespace-nowrap animate-marquee">
            <Link to={`/news/${currentItem.id}`} className="mr-4 sm:mr-6 inline-block hover:underline text-sm sm:text-base">
              {currentItem.title}
            </Link>
          </div>
        </div>
        <Link to="/breaking" className="hidden sm:flex items-center ml-2 sm:ml-4 text-xs hover:underline flex-shrink-0">
          <span>और देखें</span>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Link>
      </div>
    </div>
  );
}