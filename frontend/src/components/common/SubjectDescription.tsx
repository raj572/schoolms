import { useState } from "react";

const SubjectDescription = ({ description }: { description: string }) => {
  const [expanded, setExpanded] = useState(false);

  if (!description) return null;

  return (
    <div className="mt-1 text-sm text-slate-600">
      <p
        className={`transition-all duration-300 overflow-hidden ${
          expanded ? "max-h-[1000px]" : "line-clamp-3"
        }`}
      >
        {description}
      </p>

      {description.length > 100 && (
        <button
          className="text-primary underline text-xs mt-1"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Less" : "More"}
        </button>
      )}
    </div>
  );
};

export default SubjectDescription;
