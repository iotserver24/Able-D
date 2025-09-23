export function AudioControls({ audioUrl, label }) {
  if (!audioUrl) return null;

  return (
    <div className="space-y-2">
      {label && (
        <div className="text-sm font-medium text-gray-700">{label}</div>
      )}
      <audio
        src={audioUrl}
        controls
        className="w-full"
        style={{
          height: '36px',
          borderRadius: '6px',
          backgroundColor: '#f3f4f6'
        }}
      />
    </div>
  );
}