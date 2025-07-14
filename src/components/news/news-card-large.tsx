import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare } from "lucide-react";
import { ImageWithSkeleton } from "@/components/ui/image-skeleton";
import { scrollToTop } from "@/utils/scrollUtils";

interface NewsCardLargeProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  publishedAt: string;
  commentsCount?: number;
  featured?: boolean;
}

const NewsCardLarge = React.memo(function NewsCardLarge({
  id,
  title,
  excerpt,
  category,
  imageUrl,
  publishedAt,
  commentsCount = 0,
  featured = false,
}: NewsCardLargeProps) {
  return (
    <Link to={`/news/${id}`} className="block" onClick={scrollToTop}>
      <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${featured ? "border-primary border-2" : ""}`}>
        <div className="relative">
          <ImageWithSkeleton
            src={imageUrl}
            alt={title}
            aspectRatio="video"
            category={category}
            width={800}
            height={450}
            className="w-full"
          />
          <Badge className="absolute top-2 sm:top-4 left-2 sm:left-4 text-xs sm:text-sm">
            {category}
          </Badge>
        </div>
        <CardContent className="p-3 sm:p-4 space-y-2">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold line-clamp-2 sm:line-clamp-3 leading-tight">{title}</h2>
          <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 leading-relaxed">{excerpt}</p>
        </CardContent>
        <CardFooter className="p-3 sm:p-4 pt-0 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              <span>{publishedAt}</span>
            </div>
            {commentsCount > 0 && (
              <div className="flex items-center">
                <MessageSquare className="mr-1 h-4 w-4" />
                <span>{commentsCount}</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
});

export { NewsCardLarge };