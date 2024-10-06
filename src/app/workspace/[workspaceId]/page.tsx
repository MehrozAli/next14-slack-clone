interface WorkspacePageProps {
  params: {
    workspaceId: string;
  }
}

const WorkspacePage = ({ params }: WorkspacePageProps) => {
  return (
    <div>Workspace ID: {params.workspaceId}</div>
  )
}

export default WorkspacePage;
