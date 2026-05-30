function AppointmentModal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Calendar Action</p>
            <h2>{title}</h2>
          </div>

          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}

export default AppointmentModal;