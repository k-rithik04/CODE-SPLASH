import { getSessionFromCookies } from "@/lib/auth";
import AdminSidebar from "@/components/cms/Sidebar";
import { RoleProviderWrapper } from "./RoleProviderWrapper";
import GSAPWrapper from "@/components/cms/GSAPWrapper";

export const metadata = {
  title: "CodeSplash CMS",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookies();

  // Login and Change Password pages render without sidebar
  const isAuthPage = !session || session.must_change_password;

  if (isAuthPage) {
    return (
      <div className="admin-layout-root dark min-h-screen bg-bg text-white">
        {children}
      </div>
    );
  }

  return (
    <div className="admin-layout-root dark min-h-screen bg-black text-white flex relative">
      {/* Premium subtle background glow */}
      <div className="absolute top-0 left-[20%] w-[800px] h-[800px] bg-orange/10 rounded-full blur-[120px] -z-10 opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <RoleProviderWrapper
        user={{
          id: session.id,
          username: session.username,
          role: session.role,
          full_name: session.full_name,
        }}
      >
        <AdminSidebar />
        <main className="flex-1 ml-[260px] p-8 z-10">
          <GSAPWrapper>
            {children}
          </GSAPWrapper>
        </main>
      </RoleProviderWrapper>
    </div>
  );
}
