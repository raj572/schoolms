import { useState } from 'react';

const ServiceCardDescription = ({ description }: { description: string }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-2  text-sm text-slate-500">
      <p
        className={`transition-all duration-300 overflow-hidden ${
          expanded ? 'max-h-[1000px]' : 'line-clamp-3'
        }`}
      >
        {description}
      </p>

      {/* Toggle button */}
      {description.length > 100 && ( // show toggle only if description is long
        <button
          className="text-primary underline text-xs mt-1"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Less' : 'More'}
        </button>
      )}
    </div>
  );
};

export default ServiceCardDescription
