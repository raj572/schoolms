"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange }) => {
  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="p-4">
            <Textarea
              rows={8}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Write your markdown content here..."
              className="w-full font-mono text-sm"
            />
          </TabsContent>

          <TabsContent
            value="preview"
            className="p-4 prose prose-sm dark:prose-invert max-w-none"
          >
            {value.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">Nothing to preview yet...</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MarkdownEditor;
