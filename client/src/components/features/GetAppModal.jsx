function GetAppModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content get-app-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="modal-header">
          <h2>Get the Reddit App</h2>
          <p>Scan the QR code with your phone to download</p>
        </div>

        <div className="app-platforms">
          <div className="platform-card">
            <div className="platform-icon ios">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </div>
            <h3>iOS</h3>
            <div className="qr-container">
              <img src="/ios-qr-code.png" alt="iOS App QR Code" className="qr-code" />
            </div>
            <a href="https://apps.apple.com/app/reddit/id1064216828" target="_blank" rel="noopener noreferrer" className="store-link">
              <img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83" alt="Download on App Store" />
            </a>
          </div>

          <div className="platform-card">
            <div className="platform-icon android">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67c-.19-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85l1.84 3.18C4.8 10.93 3.5 12.98 3.5 15.36v.76h17v-.76c0-2.38-1.3-4.43-2.9-5.88zM7 13.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm10 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
              </svg>
            </div>
            <h3>Android</h3>
            <div className="qr-container">
              <img src="/android-qr-code.png" alt="Android App QR Code" className="qr-code" />
            </div>
            <a href="https://play.google.com/store/apps/details?id=com.reddit.frontpage" target="_blank" rel="noopener noreferrer" className="store-link">
              <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GetAppModal;
