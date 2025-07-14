import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageWithSkeleton } from "@/components/ui/image-skeleton";
import { scrollToTop } from "@/utils/scrollUtils";

interface NewsCardHorizontalProps {
  id: string;
  title: string;
  excerpt?: string;
  category: string;
  imageUrl: string;
  publishedAt: string;
}

const NewsCardHorizontal = React.memo(function NewsCardHorizontal({
  id,
  title,
  excerpt,
  category,
  imageUrl,
  publishedAt,
}: NewsCardHorizontalProps) {
  return (
    <Link to={`/news/${id}`} className="block" onClick={scrollToTop}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative sm:col-span-1">
            <ImageWithSkeleton
              src={imageUrl}
              alt={title}
              aspectRatio="landscape"
              category={category}
              width={400}
              height={300}
              className="w-full h-48 sm:h-full"
            />
            <Badge className="absolute top-2 left-2 text-xs">
              {category}
            </Badge>
          </div>
          <CardContent className="p-3 sm:p-4 sm:col-span-2 space-y-2">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold line-clamp-2 sm:line-clamp-3 leading-tight">{title}</h3>
            {excerpt && (
              <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 leading-relaxed">{excerpt}</p>
            )}
            <div className="text-xs sm:text-sm text-muted-foreground">
              {publishedAt}
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
});

export { NewsCardHorizontal };