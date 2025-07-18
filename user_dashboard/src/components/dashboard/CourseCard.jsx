import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { BookOpen, Clock } from "lucide-react";

export function CourseCard({
  id,
  title,
  description,
  image,
  progress,
  lessonsCount,
  category,
  duration
}) {
  return (
    <div>
      <Link 
        to={`/courses/${id}`}
        className="flex flex-col overflow-hidden rounded-lg border bg-card min-h-[220px]"
      >
        <div className="w-full relative overflow-hidden bg-muted" style={{height: '110px'}}>
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full"
            style={{height: '110px'}}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0"></div>
          <Badge 
            variant="secondary" 
            className="absolute top-1 right-1 text-xs px-2 py-0.5"
          >
            {category}
          </Badge>
        </div>
        
        <div className="flex flex-col flex-1 p-3 relative">
          <h3 className="font-semibold text-base line-clamp-1">{title}</h3>
          <p className="text-muted-foreground line-clamp-2 text-xs mt-1 mb-2">{description}</p>
          <div className="flex items-center text-xs text-muted-foreground gap-3 mt-auto">
            <div className="flex items-center gap-1">
              <BookOpen size={12} />
              <span>{lessonsCount} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{duration}</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-1.5"
              indicatorClassName="bg-gradient-to-r from-primary to-purple-400"
            />
          </div>
        </div>
      </Link>
    </div>
  );
}

export default CourseCard;