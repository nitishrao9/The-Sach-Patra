import { useState } from "react";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string;
}

interface PhotoGalleryProps {
  title: string;
  images: GalleryImage[];
}

export function PhotoGallery({ title, images }: PhotoGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  const handleOpen = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link to="/photo-gallery" className="flex items-center text-sm hover:text-primary">
          <span>सभी तस्वीरें देखें</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {images.slice(0, 4).map((image, index) => (
          <div 
            key={image.id}
            className="relative aspect-square overflow-hidden cursor-pointer"
            onClick={() => handleOpen(index)}
          >
            <img
              src={image.imageUrl}
              alt={image.caption}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {index === 3 && images.length > 4 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white font-bold">
                +{images.length - 4}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-3xl p-0 bg-background/80 backdrop-blur-sm">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 z-10"
              onClick={() => setIsOpen(false)}
            >
              <X />
            </Button>
            <div className="relative h-[70vh] w-full">
              <img
                src={images[currentIndex]?.imageUrl}
                alt={images[currentIndex]?.caption}
                className="w-full h-full object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/20 hover:bg-black/40"
                onClick={handlePrevious}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/20 hover:bg-black/40"
                onClick={handleNext}
              >
                <ChevronRight />
              </Button>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                <p className="text-lg">{images[currentIndex]?.caption}</p>
                <p className="text-sm text-gray-300">{currentIndex + 1} / {images.length}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}