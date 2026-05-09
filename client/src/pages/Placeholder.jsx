import React from 'react';

function Placeholder({ title = 'Coming Soon' }) {
  return (
    <div style={{ padding: 24 }}>
      <h1>{title}</h1>
      <p style={{ color: 'var(--muted)' }}>This page is not implemented yet — coming soon.</p>
    </div>
  );
}

export default Placeholder;
