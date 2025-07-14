import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, MapPin } from 'lucide-react';
import { getAllStatesForDropdown, getStatesByType } from '@/utils/indianStates';

interface StateDropdownProps {
  className?: string;
  variant?: 'navbar' | 'mobile';
}

export function StateDropdown({ className = '', variant = 'navbar' }: StateDropdownProps) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as 'hi' | 'en';
  const [open, setOpen] = useState(false);

  const states = getStatesByType('state');
  const unionTerritories = getStatesByType('ut');

  const buttonClass = variant === 'navbar' 
    ? "text-xs sm:text-sm font-medium hover:text-primary transition-colors flex-shrink-0 flex items-center gap-1"
    : "text-base sm:text-lg hover:text-primary transition-colors py-2 px-1 rounded-md hover:bg-muted flex items-center gap-2";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`${buttonClass} ${className}`}>
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
          {currentLanguage === 'hi' ? 'देश' : 'National'}
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 max-h-96 overflow-y-auto" 
        align={variant === 'navbar' ? 'start' : 'center'}
      >
        {/* All National News */}
        <DropdownMenuItem asChild>
          <Link 
            to="/national" 
            className="flex items-center gap-2 w-full"
            onClick={() => setOpen(false)}
          >
            <MapPin className="h-4 w-4" />
            {currentLanguage === 'hi' ? 'सभी राष्ट्रीय समाचार' : 'All National News'}
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* States */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          {currentLanguage === 'hi' ? 'राज्य' : 'States'}
        </DropdownMenuLabel>
        
        <div className="grid grid-cols-1 gap-0">
          {states.map((state) => (
            <DropdownMenuItem key={state.code} asChild>
              <Link 
                to={`/national/${state.code.toLowerCase()}`}
                className="text-sm py-1.5 px-2 hover:bg-muted rounded-sm transition-colors"
                onClick={() => setOpen(false)}
              >
                {state.name[currentLanguage]}
              </Link>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator />
        
        {/* Union Territories */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          {currentLanguage === 'hi' ? 'केंद्र शासित प्रदेश' : 'Union Territories'}
        </DropdownMenuLabel>
        
        <div className="grid grid-cols-1 gap-0">
          {unionTerritories.map((ut) => (
            <DropdownMenuItem key={ut.code} asChild>
              <Link 
                to={`/national/${ut.code.toLowerCase()}`}
                className="text-sm py-1.5 px-2 hover:bg-muted rounded-sm transition-colors"
                onClick={() => setOpen(false)}
              >
                {ut.name[currentLanguage]}
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
