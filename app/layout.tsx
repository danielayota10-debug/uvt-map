import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CS Knowledge Map — FMI UVT",
  description: "Interactive multilevel map of Computer Science areas — West University of Timișoara",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: "100%", overflow: "hidden" }}>
      <body style={{ height: "100%", overflow: "hidden", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
