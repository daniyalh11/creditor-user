import React from "react";

const HeroSection = () => {
  return (
    <section className="relative bg-cover bg-center h-[500px]" style={{ backgroundImage: "url('/path/to/hero-image.jpg')" }}>
      <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-start p-10 text-white">
        <h1 className="text-4xl font-bold">Become a member</h1>
        <p className="mt-2 text-lg">Sign up to Fine Edge Company and become a member of our learning community.</p>
      </div>
    </section>
  );
};

export default HeroSection;