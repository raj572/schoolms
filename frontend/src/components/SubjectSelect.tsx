import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SubjectSelect = ({ subjects, selected, onChange }: any) => {
  const toggleSubject = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s: string) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
        <Popover >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {selected.length > 0
            ? `${selected.length} subject${selected.length > 1 ? "s" : ""} selected`
            : "Select subjects"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

        <PopoverContent className="  p-2 space-y-1">
        {subjects.map((subject: any) => (
          <div
            key={subject.id}
            className={cn(
              "flex items-center justify-between px-2 py-1 rounded-md cursor-pointer hover:bg-gray-100 transition",
              selected.includes(subject.id) && "bg-blue-100 border border-blue-300"
            )}
            onClick={() => toggleSubject(subject.id)}
          >
            <span className="text-sm">{subject.subject_name}</span>
            {selected.includes(subject.id) && <Check className="h-4 w-4 text-blue-500" />}
          </div>
        ))}
      </PopoverContent>
      
    </Popover>
  );
};

export default SubjectSelect;