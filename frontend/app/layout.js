import "./globals.css";

export const metadata = {
  title: "AI Chatbot",
  description: "Full Stack AI Chatbot",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
