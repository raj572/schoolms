import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Book } from "lucide-react";

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  schoolId: number;
}

interface BookFormData {
  book_code: string;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  category: string;
  quantity: number;
  price: number;
  shelf_location: string;
  description: string;
}

const AddBookDialog = ({ open, onOpenChange, onSuccess, schoolId }: AddBookDialogProps) => {
  const [formData, setFormData] = useState<BookFormData>({
    book_code: "",
    title: "",
    author: "",
    publisher: "",
    isbn: "",
    category: "",
    quantity: 1,
    price: 0,
    shelf_location: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/principal/library/books/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          school_id: schoolId,
          ...formData,
        }),
      });

      const result = await response.json();

      if (result.status) {
        onSuccess();
        onOpenChange(false);
        // Reset form
        setFormData({
          book_code: "",
          title: "",
          author: "",
          publisher: "",
          isbn: "",
          category: "",
          quantity: 1,
          price: 0,
          shelf_location: "",
          description: "",
        });
      } else {
        setError(result.message || "Failed to add book");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BookFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Add New Book
          </DialogTitle>
          <DialogDescription>
            Enter the details of the book to add it to the library.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Row 1: Book Code and Title */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="book_code">Book Code *</Label>
              <Input
                id="book_code"
                placeholder="LIB-001"
                value={formData.book_code}
                onChange={(e) => handleInputChange("book_code", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Mathematics Grade 10"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 2: Author and Publisher */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="R.K. Sharma"
                value={formData.author}
                onChange={(e) => handleInputChange("author", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publisher">Publisher</Label>
              <Input
                id="publisher"
                placeholder="ABC Publications"
                value={formData.publisher}
                onChange={(e) => handleInputChange("publisher", e.target.value)}
              />
            </div>
          </div>

          {/* Row 3: ISBN and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                placeholder="978-1234567890"
                value={formData.isbn}
                onChange={(e) => handleInputChange("isbn", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Mathematics"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
              />
            </div>
          </div>

          {/* Row 4: Quantity, Price, and Shelf Location */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="10"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shelf_location">Shelf Location</Label>
              <Input
                id="shelf_location"
                placeholder="A-12-B"
                value={formData.shelf_location}
                onChange={(e) => handleInputChange("shelf_location", e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add any additional information about the book..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookDialog;

