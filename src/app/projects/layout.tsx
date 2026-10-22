import ProjectSidebar from "../components/ProjectSidebar";

export default function ProjectsLayout({
  children,
}: {
  // eslint-disable-next-line no-undef
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Project Content Area */}
          <div className="flex-1 w-full min-w-0">
            {children}
          </div>

          {/* Right Sticky Sidebar */}
          <ProjectSidebar />
        </div>
      </div>
    </div>
  );
}