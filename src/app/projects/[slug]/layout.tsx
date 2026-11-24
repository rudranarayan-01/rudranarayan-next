/* eslint-disable no-undef */
import ProjectSidebar from "../../components/ProjectSidebar";

export default function ProjectDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="flex-1 w-full min-w-0">{children}</div>
      <ProjectSidebar />
    </div>
  );
}