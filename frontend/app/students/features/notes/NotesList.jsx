import { useState } from 'react';

export function NotesList({ notes, studentType }) {
  const [selectedNote, setSelectedNote] = useState(null);

  return (
    <div className="space-y-4">
      {notes.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No notes yet. Upload a document or record audio to get started.
        </div>
      ) : (
        notes.map((note) => (
          <div
            key={note.id}
            className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => setSelectedNote(note.id === selectedNote ? null : note.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{note.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(note.timestamp).toLocaleDateString()}
                </p>
              </div>
              <button className="text-blue-500 hover:text-blue-700">
                {selectedNote === note.id ? 'Hide' : 'Show'}
              </button>
            </div>

            {selectedNote === note.id && (
              <div className="mt-4 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-gray-700">{note.summary}</p>
                </div>

                {note.suggested_questions?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Suggested Questions</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {note.suggested_questions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {studentType === 'visually_impaired' && note.audio_file && (
                  <div>
                    <h4 className="font-medium mb-2">Audio Summary</h4>
                    <audio
                      src={note.audio_file}
                      controls
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}