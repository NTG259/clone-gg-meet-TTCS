import Footer from "./components/layout/app.footer";
import Header from "./components/layout/app.header";
import "./globals.css";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-linear-to-b from-background to-muted/30">

          {children}

        </div>
      </body>
    </html>
  );
}
