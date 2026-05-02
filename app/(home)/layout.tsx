import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OrisTrade Learning Hub — Master Trading From Scratch",
  description:
    "Structured trading courses from fundamentals to advanced strategies. Learn confluence analysis, smart money concepts, options selling, and the OrisTrade system.",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
