import ClientLayout from "./ClientLayout";

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
