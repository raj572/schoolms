import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";

export default function StudentPersonal() {
  const personalInfo = {
    name: "Rohan Kumar",
    gender: "Male",
    dob: "15 March 2010",
    bloodGroup: "O+",
    contact: "+91 9876543210",
    email: "rohan.kumar@example.com",
    address: "123, Green Park, New Delhi",
    parentName: "Mr. Rajesh Kumar",
    parentContact: "+91 9876500000",
  };

  return (
    <div className="p-6 space-y-6 ml-9 m-6">
      <h1 className="text-lg font-bold">Personal Information</h1>

      <Card className="p-6 flex w-[50%] items-center gap-6">
          <User className="bg-primary text-accent w-14 h-14 mb-6 rounded-full"/>
        
        <div>
          <h2 className="text-lg font-semibold">{personalInfo.name}</h2>
          <p className="text-gray-500 text-xs">{personalInfo.gender} • {personalInfo.dob}</p>
          <p className="text-gray-500 text-xs">Blood Group: {personalInfo.bloodGroup}</p>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact & Family Details</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-xs">
          <Info label="Contact" value={personalInfo.contact} />
          <Info label="Email" value={personalInfo.email} />
          <Info label="Address" value={personalInfo.address} />
          <Separator className="md:col-span-2" />
          <Info label="Parent Name" value={personalInfo.parentName} />
          <Info label="Parent Contact" value={personalInfo.parentContact} />
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-medium">{label}</p>
      <p className="text-gray-500">{value}</p>
    </div>
  );
}
