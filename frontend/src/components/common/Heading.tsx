import React from "react";

interface HeadingProps {
  title: string;
  description?: string;
}

const Heading: React.FC<HeadingProps> = ({ title, description }) => {
  return (
    <div>
      <h2 className="text-xl md:text-2xl text-foreground font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="text-sm md:text-base md:leading-7 text-muted-foreground ">{description}</p>
      )}
    </div>
  );
};

export default Heading;
