function PractitionerHomePage() {
  const storedUser = localStorage.getItem("encounterLensUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  function handleLogout() {
    localStorage.removeItem("encounterLensToken");
    localStorage.removeItem("encounterLensUser");
    window.location.href = "/login";
  }

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Encounter Lens</p>
          <h1>Practitioner Workspace</h1>
        </div>

        <div className="top-bar-actions">
          <span>{user?.username || "Practitioner"}</span>
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="panel">
        <h2>Iteration 1 Landing Page</h2>
        <p className="subtle">
          Next we will load today’s schedule and the FHIR patient table here.
        </p>
      </section>
    </main>
  );
}

export default PractitionerHomePage;
