import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Book, Download, Eye, Clock, BookOpen, FileText, Bookmark, ClipboardList } from "lucide-react";

export default function StudentLibrary() {
  const books = [
    {
      id: 1,
      title: "Data Structures and Algorithms",
      author: "Thomas H. Cormen",
      category: "Computer Science",
      status: "Available",
      dueDate: null,
      cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Introduction to Psychology",
      author: "David G. Myers",
      category: "Psychology",
      status: "Borrowed",
      dueDate: "2024-04-15",
      cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Calculus: Early Transcendentals",
      author: "James Stewart",
      category: "Mathematics",
      status: "Available",
      dueDate: null,
      cover: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&h=300&fit=crop"
    }
  ];

  const digitalResources = [
    { id: 1, title: "Machine Learning Research Papers", type: "PDF Collection", size: "45.2 MB", downloads: 234 },
    { id: 2, title: "Programming Tutorials Video Series", type: "Video Course", size: "2.1 GB", downloads: 189 },
    { id: 3, title: "Mathematical Formulas Reference", type: "PDF Document", size: "12.8 MB", downloads: 456 }
  ];

  const bookIssues = [
    {
      id: 1,
      title: "Operating System Concepts",
      issueDate: "2024-03-01",
      dueDate: "2024-03-15",
      returnDate: "2024-03-12",
      status: "Returned"
    },
    {
      id: 2,
      title: "Database Management Systems",
      issueDate: "2024-03-20",
      dueDate: "2024-04-05",
      returnDate: null,
      status: "Borrowed"
    },
    {
      id: 3,
      title: "Artificial Intelligence",
      issueDate: "2024-02-10",
      dueDate: "2024-02-25",
      returnDate: null,
      status: "Overdue"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Returned": return "bg-green-100 text-green-700";
      case "Borrowed": return "bg-blue-100 text-blue-700";
      case "Overdue": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-6 ml-12 my-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-lg font-bold ">Library</h1>
          <p className="text-gray-500 text-xs">Access books, digital resources, and research materials</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Bookmark className="h-4 w-4" />
            My Bookmarks
          </Button>
          <Button className="gap-2">
            <Search className="h-4 w-4" />
            Advanced Search
          </Button>
        </div>
      </div>

      <Tabs defaultValue="catalog" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 shadow-md">
          <TabsTrigger value="catalog" className="gap-2">
            <Book className="h-4 w-4" />
            Catalog
          </TabsTrigger>
          <TabsTrigger value="borrowed" className="gap-2">
            <Clock className="h-4 w-4" />
            My Books
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Book Issues
          </TabsTrigger>
          <TabsTrigger value="digital" className="gap-2">
            <FileText className="h-4 w-4" />
            Digital Resources
          </TabsTrigger>
          <TabsTrigger value="research" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Research
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-500 text-xs" />
            <Input placeholder="Search books, authors, or ISBN..." className="flex-1" />
            <Button variant="outline">Filter</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card key={book.id} className="overflow-hidden">
                <div className="aspect-[3/4] bg-muted relative">
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                  <Badge
                    variant={book.status === 'Available' ? 'secondary' : 'destructive'}
                    className="absolute top-2 right-2"
                  >
                    {book.status}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{book.title}</h3>
                  <p className=" text-gray-500 text-xs mb-2">{book.author}</p>
                  <Badge variant="outline" className="text-xs mb-3">{book.category}</Badge>
                  {book.dueDate && (
                    <p className="text-xs text-destructive mb-2">Due: {book.dueDate}</p>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" disabled={book.status !== 'Available'}>
                      {book.status === 'Available' ? 'Borrow' : 'Return'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="borrowed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex text-md items-center gap-2">
                <Clock className="h-5 w-5" />
                Currently Borrowed Books
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {books.filter(book => book.status === 'Borrowed').map((book) => (
                  <div key={book.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <img src={book.cover} alt={book.title} className="w-12 h-16 object-cover rounded" />
                      <div>
                        <h4 className="font-medium text-sm">{book.title}</h4>
                        <p className=" text-gray-500 text-xs">{book.author}</p>
                        <p className="text-xs text-destructive">Due: {book.dueDate}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Renew</Button>
                      <Button size="sm">Return</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex text-md items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Book Issues History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Book Title</th>
                      <th className="p-2 text-left">Issue Date</th>
                      <th className="p-2 text-left">Due Date</th>
                      <th className="p-2 text-left">Return Date</th>
                      <th className="p-2 text-left pl-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookIssues.map(issue => (
                      <tr key={issue.id} className="border-b">
                        <td className="p-2 text-xs">{issue.title}</td>
                        <td className="p-2 text-xs">{issue.issueDate}</td>
                        <td className="p-2 text-xs">{issue.dueDate}</td>
                        <td className="p-2 text-xs">{issue.returnDate ?? "—"}</td>
                        <td className="p-2 text-xs">
                          <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="digital" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {digitalResources.map((resource) => (
              <Card key={resource.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <FileText className="h-8 w-8 text-primary" />
                    <Badge variant="outline">{resource.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-2">{resource.title}</h3>
                    <p className=" text-gray-500 text-xs">Size: {resource.size}</p>
                    <p className=" text-gray-500 text-xs">{resource.downloads} downloads</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 gap-2">
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Research Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-xs">
                Access to research databases, journals, and academic papers will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
