import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  publishedAt: string;
}

interface FeaturedVideosProps {
  videos: VideoItem[];
}

export function FeaturedVideos({ videos }: FeaturedVideosProps) {
  const [activeVideo, setActiveVideo] = useState(videos[0]);

  const handleVideoSelect = (video: VideoItem) => {
    setActiveVideo(video);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold">वीडियो</h2>
        <Link to="/videos" className="flex items-center text-xs sm:text-sm hover:text-primary">
          <span>सभी वीडियो देखें</span>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              <img
                src={activeVideo.thumbnailUrl}
                alt={activeVideo.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button size="icon" className="rounded-full w-12 h-12 sm:w-16 sm:h-16 bg-primary/80 hover:bg-primary">
                  <Play className="h-6 w-6 sm:h-8 sm:w-8" />
                </Button>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-0.5 text-xs sm:text-sm rounded">
                {activeVideo.duration}
              </div>
            </div>
            <CardContent className="p-3 sm:p-4">
              <h3 className="text-lg sm:text-xl font-medium line-clamp-2">{activeVideo.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{activeVideo.publishedAt}</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 mt-4 lg:mt-0">
          <Tabs defaultValue="latest">
            <TabsList className="w-full grid grid-cols-2 h-auto">
              <TabsTrigger value="latest" className="text-sm py-2">नवीनतम</TabsTrigger>
              <TabsTrigger value="trending" className="text-sm py-2">लोकप्रिय</TabsTrigger>
            </TabsList>
            <TabsContent value="latest" className="mt-3 sm:mt-4">
              <div className="space-y-3 sm:space-y-4">
                {videos.slice(0, 5).map((video) => (
                  <div
                    key={video.id}
                    className="flex space-x-2 sm:space-x-3 cursor-pointer hover:bg-muted p-2 rounded-md transition-colors"
                    onClick={() => handleVideoSelect(video)}
                  >
                    <div className="relative w-20 h-12 sm:w-24 sm:h-16 flex-shrink-0">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover rounded-md"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1 text-xs rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium line-clamp-2">{video.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{video.publishedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="trending" className="mt-4">
              <div className="space-y-4">
                {videos.slice(2, 7).map((video) => (
                  <div 
                    key={video.id}
                    className="flex space-x-3 cursor-pointer hover:bg-muted p-2 rounded-md"
                    onClick={() => handleVideoSelect(video)}
                  >
                    <div className="relative w-24 h-16 flex-shrink-0">
                      <img 
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover rounded-md"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1 text-xs rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                      <p className="text-xs text-muted-foreground">{video.publishedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}