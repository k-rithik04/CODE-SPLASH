export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          body {
            height: auto !important;
            min-height: 100vh !important;
          }
        `,
        }}
      />
      {children}
    </>
  );
}
