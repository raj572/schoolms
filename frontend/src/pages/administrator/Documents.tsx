import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Receipt,
  GraduationCap,
  ClipboardCheck,
  CreditCard,
  Award,
  FileCheck,
  ExternalLink,
  Download,
  Printer,
  Search,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Heading from "@/components/common/Heading";
import { OFFICIAL_DOCUMENTS, DocumentMeta, DocumentType, getDocumentUrl, openDocument } from "@/lib/documentUtils";

const iconMap: Record<string, React.ElementType> = {
  Receipt,
  FileCheck,
  GraduationCap,
  ClipboardCheck,
  FileText,
  CreditCard,
  Award,
};

export default function AdministratorDocuments() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [studentIdInput, setStudentIdInput] = useState("");
  const [activePreviewDoc, setActivePreviewDoc] = useState<{
    meta: DocumentMeta;
    url: string;
  } | null>(null);

  const categories = ["all", "Finance", "Academic", "Certificates", "Identity"];

  const filteredDocs = OFFICIAL_DOCUMENTS.filter((doc) => {
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenDoc = (type: DocumentType, isDownload: boolean = false) => {
    const id = studentIdInput.trim() !== "" ? studentIdInput.trim() : null;
    openDocument(type, id, isDownload);
  };

  const handlePreviewInModal = (doc: DocumentMeta) => {
    const id = studentIdInput.trim() !== "" ? studentIdInput.trim() : null;
    const base = getDocumentUrl(doc.type, id, false);
    const url = `${base}${base.includes('?') ? '&' : '?'}embed=1`;
    setActivePreviewDoc({ meta: doc, url });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Heading
          title="Official Documents & Certificates"
          description="Generate, preview, print and download statutory school operational documents and student certificates."
        />
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-xs border-primary text-primary font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 7 Document Types Active
          </Badge>
        </div>
      </div>

      {/* Quick Student/Payment Selector Strip */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-background">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <span>Direct Record Generator</span>
                <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                  Automated
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">
                Enter a specific <strong>Student ID</strong> or <strong>Payment ID</strong> to populate authentic database records, or leave blank to preview sample templates.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-56">
                <Input
                  type="text"
                  placeholder="Student or Payment ID (e.g. 1)"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              {studentIdInput && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStudentIdInput("")}
                  className="h-9 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-5 w-full sm:w-auto">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="capitalize text-xs">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Document Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => {
          const Icon = iconMap[doc.icon] || FileText;
          return (
            <Card
              key={doc.type}
              className="flex flex-col justify-between hover:shadow-lg transition-all duration-200 border-border/80 hover:border-primary/50 group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="secondary" className="text-[11px] font-semibold">
                    {doc.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                  {doc.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 leading-relaxed">
                  {doc.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">{doc.category}</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PDF & Print Ready
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold"
                    onClick={() => handlePreviewInModal(doc)}
                  >
                    <Printer className="w-3.5 h-3.5 mr-1.5" /> Quick Preview
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full text-xs font-semibold"
                    onClick={() => handleOpenDoc(doc.type, true)}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground hover:text-foreground h-8"
                  onClick={() => handleOpenDoc(doc.type, false)}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Open in New Tab
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <Card className="text-center py-12">
          <CardContent className="space-y-3">
            <FileText className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="text-base font-semibold">No documents found matching "{searchQuery}"</p>
            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Interactive Modal Preview Dialog */}
      <Dialog open={!!activePreviewDoc} onOpenChange={(open) => !open && setActivePreviewDoc(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[92vh] max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-xl border border-border shadow-2xl">
          <DialogHeader className="p-4 px-6 border-b border-border flex flex-row items-center justify-between pr-14 flex-shrink-0 bg-background">
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <span>{activePreviewDoc?.meta.title}</span>
                <Badge variant="outline" className="text-xs font-normal">
                  Live View
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Official document preview rendered from backend templates.
              </DialogDescription>
            </div>
            {activePreviewDoc && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const iframe = document.getElementById('preview-doc-iframe') as HTMLIFrameElement;
                    if (iframe && iframe.contentWindow) {
                      iframe.contentWindow.print();
                    } else {
                      window.print();
                    }
                  }}
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => openDocument(activePreviewDoc.meta.type, studentIdInput || null, false)}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Full Window
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs"
                  onClick={() => openDocument(activePreviewDoc.meta.type, studentIdInput || null, true)}
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF
                </Button>
              </div>
            )}
          </DialogHeader>

          <div className="flex-1 w-full min-h-0 bg-slate-100 dark:bg-slate-900/60 p-2 sm:p-4 overflow-hidden">
            {activePreviewDoc && (
              <iframe
                id="preview-doc-iframe"
                src={activePreviewDoc.url}
                title={activePreviewDoc.meta.title}
                className="w-full h-full rounded-lg border border-border shadow-sm bg-white"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
