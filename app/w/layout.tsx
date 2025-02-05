export default function WordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <div>
        <a href="/">Retour à la liste</a>
      </div>
      {children}
    </div>
  );
}
