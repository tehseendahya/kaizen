import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import StudyDoc from "./study-doc";

export const metadata: Metadata = {
  title: "CS201 Study Pack — Units 1–10",
  description:
    "Khan Academy–style study guide covering Units 1–10: algorithms, objects, arrays, sets, maps, hashing, Big-O, and more.",
  openGraph: {
    title: "CS201 Study Pack — Units 1–10",
    description:
      "Khan Academy–style study guide covering Units 1–10: algorithms, objects, arrays, sets, maps, hashing, Big-O, and more.",
    type: "article",
    url: "/study/cs201",
  },
};

async function loadMarkdown() {
  const file = path.join(process.cwd(), "content", "study", "cs201.md");
  const buf = await fs.readFile(file, "utf8");
  return buf;
}

export default async function Page() {
  const markdown = await loadMarkdown();
  return <StudyDoc markdown={markdown} />;
}

