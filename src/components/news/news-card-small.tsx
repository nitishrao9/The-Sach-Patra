import { Link } from "react-router-dom";
import { ImageWithSkeleton } from "@/components/ui/image-skeleton";
import { scrollToTop } from "@/utils/scrollUtils";

interface NewsCardSmallProps {
  id: string;
  title: string;
  imageUrl: string;
  publishedAt: string;
}

export function NewsCardSmall({
  id,
  title,
  imageUrl,
  publishedAt,
}: NewsCardSmallProps) {
  return (
    <Link to={`/news/${id}`} className="group block" onClick={scrollToTop}>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300">
        <div className="relative overflow-hidden rounded-md">
          <ImageWithSkeleton
            src={imageUrl}
            alt={title}
            aspectRatio="square"
            width={200}
            height={200}
            className="group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="col-span-2 space-y-1 flex flex-col justify-between">
          <h4 className="text-sm sm:text-base font-medium line-clamp-2 sm:line-clamp-3 group-hover:text-primary transition-colors leading-tight">{title}</h4>
          <div className="text-xs text-muted-foreground">
            {publishedAt}
          </div>
        </div>
      </div>
    </Link>
  );
}