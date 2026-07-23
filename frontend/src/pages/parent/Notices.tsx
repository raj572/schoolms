import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Download, Eye } from "lucide-react";

export default function ParentNotices() {
  const notices = [
    {
      id: 1,
      title: "Annual Sports Day Announcement",
      message: "Annual Sports Day will be held on 20th April 2024. Parents are invited to attend.",
      date: "2024-04-05",
      attachment: true
    },
    {
      id: 2,
      title: "Parent-Teacher Meeting",
      message: "PTM is scheduled on 15th April 2024. Kindly be present to discuss your child's progress.",
      date: "2024-04-03",
      attachment: false
    },
    {
      id: 3,
      title: "Holiday Notice",
      message: "School will remain closed on 14th April 2024 due to a public holiday.",
      date: "2024-04-02",
      attachment: false
    }
  ];

  return (
    <div className="p-6 space-y-6 ml-9 m-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Parent Notices</h1>
        </div>
        <Button >
          <Download className="h-4 w-4 mr-2" />
          Download All
        </Button>
      </div>

      <div className="space-y-4">
        {notices.map((notice) => (
          <Card key={notice.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-md">{notice.title}</CardTitle>
                <p className="text-xs text-muted-foreground">Date: {notice.date}</p>
              </div>
              <Badge variant="secondary">Notice</Badge>
            </CardHeader>
            <CardContent className="flex items-start justify-between">
              <p className="text-xs text-gray-500 max-w-2xl">{notice.message}</p>
              <div className="flex gap-2">
                {notice.attachment && (
                  <Button  className="gap-2">
                    <Download className="h-4 w-4" />
                    Attachment
                  </Button>
                )}
                <Button size="sm" variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
