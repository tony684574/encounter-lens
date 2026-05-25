import Sidebar from "../components/Sidebar";

function PractitionerLayout({ children, user, onLogout }) {
  return (
    <div className="practitioner-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="practitioner-main">{children}</main>
    </div>
  );
}

export default PractitionerLayout;
