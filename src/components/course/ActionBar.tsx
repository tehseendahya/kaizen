import { Button } from "@/components/ui/button";
import { FileQuestion, Rows3, NotebookPen, BookOpen, MessageCircle } from "lucide-react";

export default function ActionBar(props: any) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" size="sm"><FileQuestion className="mr-2 h-4 w-4" />Generate Quiz</Button>
      <Button variant="secondary" size="sm"><Rows3 className="mr-2 h-4 w-4" />Make Flashcards</Button>
      <Button variant="secondary" size="sm"><NotebookPen className="mr-2 h-4 w-4" />Take Notes</Button>
      <Button variant="secondary" size="sm"><BookOpen className="mr-2 h-4 w-4" />Study Guide</Button>
      <Button variant="secondary" size="sm"><MessageCircle className="mr-2 h-4 w-4" />Ask AI</Button>
    </div>
  );
}
