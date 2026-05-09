function Card({ children, style = {} }) {
  return (
    <div style={{ border: '1px solid #e6e6e6', padding: 12, borderRadius: 8, background: '#fff', ...style }}>
      {children}
    </div>
  );
}

export default Card;
