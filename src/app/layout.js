export const metadata = {
  title: 'Nanyang Polytechnic Virtual Forum',
  description: 'AI-Powered Education Focus Group — Nanyang Polytechnic',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
