// src/components/EmptyState.tsx

// 這是一個簡單的組件，不需要 Props，因為它只是顯示固定的訊息
export const EmptyState = () => {
  return (
    <div style={emptyStyles}>
      <div style={{ fontSize: '48px', marginBottom: '10px' }}>📂</div>
      <h3>There are currently no projects.</h3>
      <p style={{ color: '#666' }}>Please try again later, or try adding some data.</p>
    </div>
  );
};

// 簡單的行內樣式，讓它居中顯示
const emptyStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px',
  border: '2px dashed #ccc',
  borderRadius: '8px',
  marginTop: '20px',
  textAlign: 'center'
};