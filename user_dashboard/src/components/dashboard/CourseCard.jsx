import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { BookOpen, Clock } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Link 
        to={`/courses/${id}`}
        className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30"
      >
        <div className="aspect-video w-full relative overflow-hidden bg-muted">
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full transition-all duration-700 group-hover:scale-110 group-hover:saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2 transition-all duration-300 group-hover:bg-primary group-hover:text-white"
          >
            {category}
          </Badge>
        </div>
        
        <div className="flex flex-col flex-1 p-4 relative group-hover:bg-accent/30 transition-colors duration-300">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors duration-300">{title}</h3>
          <p className="text-muted-foreground line-clamp-2 text-sm mt-1 mb-4">{description}</p>
          
          <div className="flex items-center text-sm text-muted-foreground gap-4 mt-auto">
            <div className="flex items-center gap-1 group-hover:text-primary/80 transition-colors duration-300">
              <BookOpen size={14} className="group-hover:animate-bounce-subtle" />
              <span>{lessonsCount} lessons</span>
            </div>
            <div className="flex items-center gap-1 group-hover:text-primary/80 transition-colors duration-300">
              <Clock size={14} className="group-hover:animate-bounce-subtle" />
              <span>{duration}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium group-hover:text-primary transition-colors duration-300">{progress}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 transition-all duration-300 group-hover:h-3" 
              indicatorClassName="bg-gradient-to-r from-primary to-purple-400 group-hover:animate-pulse-subtle"
            />
          </div>
          
          <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-rainbow-gradient bg-size-200 bg-pos-0 group-hover:bg-pos-100 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
        </div>
      </Link>
    </motion.div>
  );
}

export default CourseCard;