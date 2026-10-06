import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Send, Mail, Users, User, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function StudentMessages() {
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMsgModal, setShowNewMsgModal] = useState(false);
  const [newMsgRecipient, setNewMsgRecipient] = useState("");
  const [newMsgSubject, setNewMsgSubject] = useState("");
  const [newMsgContent, setNewMsgContent] = useState("");

  const [threadMessages, setThreadMessages] = useState([
    {
      id: 1,
      sender: "Dr. Priya Sharma",
      isSelf: false,
      text: "Dear Students, This is a friendly reminder that your Data Structures assignment is due this Friday, March 29th at 11:59 PM. Please make sure to submit your solutions through the college portal.",
      time: "Received 2 hours ago"
    }
  ]);

  const messagesList = [
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

  const handleSendReply = () => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setThreadMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: "You",
          isSelf: true,
          text: replyText.trim(),
          time: "Just now"
        }
      ]);
      setReplyText("");
      setIsSending(false);
      toast.success("Reply sent successfully!");
    }, 400);
  };

  const handleSendNewMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgRecipient || !newMsgSubject || !newMsgContent) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success(`Message sent to ${newMsgRecipient}`);
    setShowNewMsgModal(false);
    setNewMsgRecipient("");
    setNewMsgSubject("");
    setNewMsgContent("");
  };

  const filteredMessages = messagesList.filter(m => 
    !searchQuery || 
    m.sender.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground text-xs mt-1">Communicate with teachers and classmates</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => setShowNewMsgModal(true)}>
          <Send className="h-4 w-4" />
          New Message
        </Button>
      </div>

      <Tabs defaultValue="inbox" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
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
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input 
              placeholder="Search messages..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-2">
              {filteredMessages.map((message) => (
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
                            <Badge variant="secondary" className="h-2 w-2 rounded-full p-0 bg-primary"></Badge>
                          )}
                        </div>
                        <p className={`text-sm truncate ${message.unread ? 'font-medium' : 'text-muted-foreground'}`}>
                          {message.subject}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {message.preview}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
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
                    <AvatarFallback>PS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Dr. Priya Sharma</CardTitle>
                    <p className="text-sm text-muted-foreground">Assignment Submission Reminder</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-6">
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {threadMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`p-3 rounded-lg text-xs leading-relaxed max-w-[85%] ${
                        msg.isSelf 
                          ? 'ml-auto bg-primary text-primary-foreground' 
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="font-semibold mb-1">{msg.sender}</p>
                      <p>{msg.text}</p>
                      <p className="text-[10px] opacity-75 mt-1 text-right">{msg.time}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <Textarea 
                    placeholder="Type your reply..." 
                    className="min-h-[90px]" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button className="gap-2" onClick={handleSendReply} disabled={isSending}>
                      <Send className="h-4 w-4" />
                      {isSending ? "Sending..." : "Send Reply"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Teacher Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["Dr. Priya Sharma (Mathematics)", "Prof. R.K. Mehta (Physics)", "Mrs. Ananya Sen (Chemistry)"].map((teacher, i) => (
                  <div key={i} className="p-3 border rounded-lg flex items-center justify-between">
                    <span className="text-xs font-medium">{teacher}</span>
                    <Button size="sm" variant="outline" onClick={() => {
                      setNewMsgRecipient(teacher);
                      setShowNewMsgModal(true);
                    }}>
                      Message
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Student Groups & Classmates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["Rahul Kumar", "Sneha Roy", "Aman Verma"].map((studentName, i) => (
                  <div key={i} className="p-3 border rounded-lg flex items-center justify-between">
                    <span className="text-xs font-medium">{studentName}</span>
                    <Button size="sm" variant="outline" onClick={() => {
                      setNewMsgRecipient(studentName);
                      setShowNewMsgModal(true);
                    }}>
                      Message
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Message Modal */}
      <Dialog open={showNewMsgModal} onOpenChange={setShowNewMsgModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>Send a message to a teacher or classmate</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendNewMessage} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Recipient</label>
              <Input 
                placeholder="Teacher or student name..."
                value={newMsgRecipient}
                onChange={(e) => setNewMsgRecipient(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Subject</label>
              <Input 
                placeholder="Enter message subject..."
                value={newMsgSubject}
                onChange={(e) => setNewMsgSubject(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Message</label>
              <Textarea 
                placeholder="Write your message content..."
                rows={4}
                value={newMsgContent}
                onChange={(e) => setNewMsgContent(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowNewMsgModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Send Message</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}