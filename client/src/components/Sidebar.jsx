function Sidebar({ user, onLogout }) {
  return (
    <aside className="sidebar">
      <div>
        <p className="eyebrow">Encounter Lens</p>
        <h2 className="sidebar-title">Clinic Desk</h2>
      </div>

      <nav className="sidebar-nav" aria-label="Practitioner navigation">
        <a href="/" className="sidebar-link">
          Today
        </a>
        <a href="/calendar" className="sidebar-link">
          Calendar
        </a>
        <a href="/#patients" className="sidebar-link">
          Patients
        </a>
      </nav>

      <div className="sidebar-footer">
        <p className="subtle">Signed in as</p>
        <strong>{user?.username || "Practitioner"}</strong>
        <button type="button" className="secondary-button full-width" onClick={onLogout}>
          Log out
        </button>
      </div>
    </aside>
    
  );
}

export default Sidebar;
