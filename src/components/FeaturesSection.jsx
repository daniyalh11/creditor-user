import React from "react";

const features = [
  {
    title: "Captivating Courses",
    description: "Interactive courses will keep learners engaged and learning faster.",
    button: "View Catalog",
  },
  {
    title: "Professional Instructors",
    description: "We have the best instructors in the region. Learn more about them.",
    button: "About Fine Edge Company",
  },
  {
    title: "Enjoyable Activities",
    description: "The Fine Edge Company has exciting annual activities planned.",
    button: "Upcoming Events",
  },
  {
    title: "Enroll with Us",
    description: "Don’t hesitate to ask us a question. We’re happy to help.",
    button: "Contact",
  },
];

const FeaturesSection = () => {
  return (
    <section className="flex justify-around py-16 bg-gray-100">
      {features.map((feature, index) => (
        <div key={index} className="text-center max-w-xs">
          <h2 className="text-xl font-bold">{feature.title}</h2>
          <p className="mt-2 text-gray-600">{feature.description}</p>
          <button className="mt-4 bg-teal-500 text-white px-4 py-2 rounded-lg">
            {feature.button}
          </button>
        </div>
      ))}
    </section>
  );
};

export default FeaturesSection;
