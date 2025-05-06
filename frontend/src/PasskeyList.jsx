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
<div>
      <h2>Passkeys for {username}</h2>
      <ul>
        {passkeys.map(({ credentialId, name }) => (
          <li
            key={credentialId}
            className="flex justify-between items-center p-4 border rounded shadow-sm bg-white"
          >
            <div>
              <div>{credentialId}</div>
              <div>{name || 'Unnamed'}</div>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setModal({ type: 'rename', credentialId })}
              >
                Rename
              </button>
              <button
                onClick={() => setModal({ type: 'delete', credentialId })}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={() => setModal({ type: 'register' })}
      >
        Register a new passkey
      </button>

      {modal && (
        <div>
          <div>
            {modal.type === 'rename' && (
              <div>
                <h3>Rename Passkey</h3>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New name"
                />
                <div>
                  <button
                    onClick={handleRename}
                  >
                    Submit
                  </button>
                  <button
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {modal.type === 'delete' && (
              <div>
                <h3>Confirm Delete</h3>
                <p>
                  Are you sure you want to delete <span className="font-mono">{modal.credentialId}</span>?
                </p>
                <div>
                  <button
                    onClick={handleDelete}
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {modal.type === 'register' && (
              <div>
                <h3>Register New Passkey</h3>
                <div>
                  <button
                    onClick={handleRegister}
                  >
                    Proceed
                  </button>
                  <button
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
