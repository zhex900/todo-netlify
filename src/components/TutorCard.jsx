import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, Star, Clock, DollarSign } from "lucide-react";

export function TutorCard({ tutor, onContact }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={tutor.image}
            alt={tutor.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="mb-1">{tutor.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{tutor.suburb}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{tutor.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({tutor.totalReviews})
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {tutor.bio}
          </p>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">Instruments</p>
              <div className="flex flex-wrap gap-2">
                {tutor.instruments.map((instrument) => (
                  <Badge key={instrument} variant="secondary">
                    {instrument}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{tutor.experience} years exp.</span>
              </div>
              <div className="flex items-center gap-1 font-medium">
                <DollarSign className="w-4 h-4" />
                <span>${tutor.hourlyRate}/hr</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button onClick={() => onContact(tutor)} className="w-full">
          Contact Tutor
        </Button>
      </CardFooter>
    </Card>
  );
}
