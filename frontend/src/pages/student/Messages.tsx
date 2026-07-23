import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Send, Mail, Users, User } from "lucide-react";

export default function StudentMessages() {
  const messages = [
    {
      id: 1,
      sender: "Dr. Priya Sharma",
      subject: "Assignment Submission Reminder",
      preview: "Please submit your Data Structures assignment by Friday...",
      time: "2 hours ago",
      unread: true,
      type: "teacher"
    },
    {
      id: 2,
      sender: "Academic Office",
      subject: "Semester Fee Payment Due",
      preview: "This is to remind you that the semester fee payment...",
      time: "1 day ago",
      unread: true,
      type: "admin"
    },
    {
      id: 3,
      sender: "Rahul Kumar",
      subject: "Study Group for Math Exam",
      preview: "Hey! Want to join our study group for the upcoming...",
      time: "2 days ago",
      unread: false,
      type: "student"
    }
  ];

  return (
    <div className="p-6 space-y-6 ml-12 my-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-lg font-bold ">Messages</h1>
          <p className="text-gray-500 text-xs">Communicate with teachers and classmates</p>
        </div>
        <Button className="gap-2">
          <Send className="h-4 w-4" />
          New Message
        </Button>
      </div>

      <Tabs defaultValue="inbox" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 shadow-md">
          <TabsTrigger value="inbox" className="gap-2">
            <Mail className="h-4 w-4" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="teachers" className="gap-2">
            <User className="h-4 w-4" />
            Teachers
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          <div className="flex items-center ">
            <Input placeholder="Search messages..." className="flex-1" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-2">
              {messages.map((message) => (
                <Card key={message.id} className={`cursor-pointer transition-colors hover:bg-muted/50 ${message.unread ? 'border-primary/50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 text-md">
                        <AvatarFallback>
                          {message.sender.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium text-sm truncate ${message.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {message.sender}
                          </p>
                          {message.unread && (
                            <Badge variant="secondary" className="h-2 w-2 rounded-full p-0"></Badge>
                          )}
                        </div>
                        <p className={`text-sm truncate ${message.unread ? 'font-medium' : 'text-muted-foreground'}`}>
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {message.preview}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.time}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="lg:col-span-2">
              <CardHeader className="border-b">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>DPS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Dr. Priya Sharma</CardTitle>
                    <p className="text-sm text-muted-foreground">Assignment Submission Reminder</p>
                    <p className="text-xs text-gray-500 mt-1">Received 2 hours ago</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none text-xs">
                    <p>Dear Students,</p>
                    <p>
                      This is a friendly reminder that your Data Structures assignment is due this Friday, 
                      March 29th at 11:59 PM. Please make sure to submit your solutions through the college portal.
                    </p>
                    <p>
                      The assignment covers topics from Chapters 4-6 including:
                    </p>
                    <ul>
                      <li>Binary Trees</li>
                      <li>Graph Algorithms</li>
                      <li>Hash Tables</li>
                    </ul>
                    <p>
                      If you have any questions, please don't hesitate to reach out during office hours 
                      or reply to this message.
                    </p>
                    <p>Best regards,<br />Dr. Priya Sharma</p>
                  </div>
                  
                  <div className="border-t pt-4 space-y-3">
                    <Textarea placeholder="Type your reply..." className="min-h-[100px]" />
                    <div className="flex justify-end">
                      <Button className="gap-2">
                        <Send className="h-4 w-4" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Contact Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Teacher contacts and messaging will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Student Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm">Student messaging and group chats will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}