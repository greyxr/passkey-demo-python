import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const fetchPasskeys = async (username) => {
    try {
      const response = await fetch(`http://localhost:5000/passkeys/` + username);
      if (!response.ok) {
        toast.error("Failed to get passkeys from the server");
        return;
      }
      const data = await response.json();
      console.log("Passkeys:")
      console.log(data)
      return data.passkeys
    } catch (error) {
      toast.error("Error fetching passkeys");
      return
    }
};

const deletePasskey = async (credentialId) => {
  alert(`Deleted passkey: ${credentialId}`);
};

const renamePasskey = async (credentialId, newName) => {
  alert(`Renamed ${credentialId} to ${newName}`);
};

const registerPasskey = async (username) => {
  alert(`Registered new passkey for ${username}`);
};

const PasskeyList = ({ username }) => {
  const [passkeys, setPasskeys] = useState([]);
  const [modal, setModal] = useState(null);
  const [newName, setNewName] = useState('');

  const loadPasskeys = useCallback(async () => {
    const data = await fetchPasskeys(username);
    setPasskeys(data);
  }, [username]);

  useEffect(() => {
    loadPasskeys();
  }, [loadPasskeys]);

  const closeModal = async () => {
    setModal(null);
    setNewName('');
    await loadPasskeys();
  };

  const handleRename = async () => {
    await renamePasskey(modal.credentialId, newName);
    closeModal();
  };

  const handleDelete = async () => {
    await deletePasskey(modal.credentialId);
    closeModal();
  };

  const handleRegister = async () => {
    await registerPasskey(username);
    closeModal();
  };

  return (
<div className="w-full px-4 py-4">
      <h2 className="text-2xl font-semibold mb-4">Passkeys for {username}</h2>
      <ul className="space-y-3 mb-4">
        {passkeys.map(({ credentialId, name }) => (
          <li
            key={credentialId}
            className="flex justify-between items-center p-4 border rounded shadow-sm bg-white"
          >
            <div>
              <div className="font-mono text-sm text-gray-700">{credentialId}</div>
              <div className="text-gray-500">{name || 'Unnamed'}</div>
            </div>
            <div className="space-x-2">
              <button
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setModal({ type: 'rename', credentialId })}
              >
                Rename
              </button>
              <button
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => setModal({ type: 'delete', credentialId })}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        onClick={() => setModal({ type: 'register' })}
      >
        Register a new passkey
      </button>

      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            {modal.type === 'rename' && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Rename Passkey</h3>
                <input
                  type="text"
                  className="w-full border p-2 rounded mb-3"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New name"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={handleRename}
                  >
                    Submit
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {modal.type === 'delete' && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
                <p className="mb-4 text-gray-700">
                  Are you sure you want to delete <span className="font-mono">{modal.credentialId}</span>?
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={handleDelete}
                  >
                    Yes, delete
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {modal.type === 'register' && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Register New Passkey</h3>
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={handleRegister}
                  >
                    Proceed
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasskeyList;
