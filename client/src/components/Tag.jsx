export default function Tag({ type }) {
  const styles = {
    'Coding': 'bg-green-100 text-green-700',
    'System Design': 'bg-purple-100 text-purple-700',
    'Behavioral': 'bg-yellow-100 text-yellow-700',
    'Active': 'bg-green-100 text-green-700',
    'In Progress': 'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`text-xs px-2 py-1 rounded ${styles[type] || 'bg-gray-200 text-gray-700'}`}>
      {type}
    </span>
  );
}