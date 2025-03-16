import { Card, CardContent } from "@/components/ui/card";
import { StarIcon } from "lucide-react";

interface Review {
  id: number;
  author: string;
  date: string;
  rating: number;
  content: string;
}

const reviews: Review[] = [
  {
    id: 1,
    author: "Adrienne Johnston",
    date: "March 16",
    rating: 5,
    content: "It was a wonderful experience! I had a problem and the lovely employ..."
  },
  {
    id: 2,
    author: "Carrie",
    date: "March 15",
    rating: 5,
    content: "Nice templates to choose from"
  },
  {
    id: 3,
    author: "José Tovar",
    date: "March 15",
    rating: 5,
    content: "Great Tools. I am so happy with the use and result"
  }
];

export default function ReviewsSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Highly Rated by Job Seekers</h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className="w-5 h-5 text-green-500 fill-green-500"
                />
              ))}
            </div>
            <span className="text-lg font-medium">Excellent</span>
          </div>
          <p className="text-muted-foreground">
            Based on {(11485).toLocaleString()} reviews
          </p>
          <img
            src="/trustpilot-logo.svg"
            alt="Trustpilot"
            className="h-6 mx-auto mt-4"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className="w-5 h-5 text-green-500 fill-green-500"
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground">{review.date}</span>
                </div>
                <p className="mb-4">{review.content}</p>
                <p className="font-medium">{review.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
