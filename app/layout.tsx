import { Inter } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Storynix - Histoires personnalisées pour enfants",
  description:
    "Créez des histoires audio magiques et personnalisées pour vos enfants, compatibles avec Lunii. Génération par IA en moins de 2 minutes.",
  keywords:
    "Lunii, histoires enfants, audio, personnalisé, IA, conte, storytelling",
  authors: [{ name: "Storynix" }],
  openGraph: {
    title: "Storynix - Histoires personnalisées pour enfants",
    description:
      "Créez des histoires audio magiques et personnalisées pour vos enfants",
    type: "website",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  );
}
