import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const galleryImages = [
  {
    id: 1,
    url: "https://cdn.poehali.dev/projects/a77f3863-9c1d-453e-a729-26317a41486a/files/55c304ff-574a-4642-a923-0d683451f05f.jpg",
    prompt: "Футуристический город с неоновыми огнями",
    likes: 234
  },
  {
    id: 2,
    url: "https://cdn.poehali.dev/projects/a77f3863-9c1d-453e-a729-26317a41486a/files/87301b74-3b16-4269-a0f3-68319ff94d68.jpg",
    prompt: "Абстрактная визуализация нейросети",
    likes: 189
  },
  {
    id: 3,
    url: "https://cdn.poehali.dev/projects/a77f3863-9c1d-453e-a729-26317a41486a/files/bbf86c50-2f65-4201-b4e3-43c835bfaeeb.jpg",
    prompt: "Магический фэнтезийный пейзаж",
    likes: 312
  },
  {
    id: 4,
    url: "https://picsum.photos/seed/gallery4/800/600",
    prompt: "Космическая станция в далеком будущем",
    likes: 156
  },
  {
    id: 5,
    url: "https://picsum.photos/seed/gallery5/800/600",
    prompt: "Подводный мир с биолюминесценцией",
    likes: 278
  },
  {
    id: 6,
    url: "https://picsum.photos/seed/gallery6/800/600",
    prompt: "Горный пейзаж на закате",
    likes: 445
  }
];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);
  const [likedImages, setLikedImages] = useState<Set<number>>(new Set());

  const toggleLike = (id: number) => {
    setLikedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <section id="gallery" className="min-h-screen py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 animate-fade-in">
          <h2 className="text-5xl font-bold">
            <span className="text-gradient">Галерея</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Вдохновитесь работами, созданными с помощью искусственного интеллекта
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <Card 
              key={image.id}
              className="group overflow-hidden border-gradient cursor-pointer animate-scale-in hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={image.url} 
                  alt={image.prompt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                    <p className="text-sm font-medium line-clamp-2">{image.prompt}</p>
                    
                    <div className="flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 hover:bg-primary/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(image.id);
                        }}
                      >
                        <Icon 
                          name="Heart" 
                          className={`w-4 h-4 transition-colors ${
                            likedImages.has(image.id) ? 'fill-primary text-primary' : ''
                          }`}
                        />
                        <span className="text-xs">
                          {image.likes + (likedImages.has(image.id) ? 1 : 0)}
                        </span>
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 hover:bg-primary/20"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Icon name="Download" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-8">
          <Button 
            size="lg" 
            variant="outline"
            className="border-gradient"
          >
            <Icon name="RefreshCw" className="mr-2 w-5 h-5" />
            Загрузить ещё
          </Button>
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl border-gradient">
          <DialogTitle className="sr-only">Просмотр изображения</DialogTitle>
          {selectedImage && (
            <div className="space-y-4">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.prompt}
                className="w-full rounded-lg"
              />
              <div className="space-y-3">
                <p className="text-lg font-medium">{selectedImage.prompt}</p>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => toggleLike(selectedImage.id)}
                  >
                    <Icon 
                      name="Heart" 
                      className={`w-4 h-4 ${
                        likedImages.has(selectedImage.id) ? 'fill-primary text-primary' : ''
                      }`}
                    />
                    {selectedImage.likes + (likedImages.has(selectedImage.id) ? 1 : 0)}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Icon name="Download" className="w-4 h-4" />
                    Скачать
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
