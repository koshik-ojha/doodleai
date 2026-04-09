import "../globals.css";

export const metadata = { title: "Chat Widget" };

export default function WidgetLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "transparent", overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
