function Button({ children, onClick, type = 'button', style = {} }) {
  return (
    <button type={type} onClick={onClick} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer', ...style }}>
      {children}
    </button>
  );
}

export default Button;
