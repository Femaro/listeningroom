import { useEffect, useState } from 'react';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, updateDoc, deleteDoc, onSnapshot, collection, serverTimestamp, setLogLevel } from 'firebase/firestore';
import '@/utils/firebase';

// Global variables provided by the Canvas environment.
// These are not placeholders and will be replaced at runtime.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase services using the shared initializer (already imported above)
const db = getFirestore();
const auth = getAuth();
// Enable Firestore debug logging
setLogLevel('debug');

// --- Custom Hooks (Typically in a `src/hooks` folder) ---

function useFirestoreData() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Effect for authentication.
  // This now just uses the imported 'auth' instance.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthenticated(true);
      } else {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            await signInAnonymously(auth);
          }
        } catch (error) {
          console.error('Authentication failed:', error);
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Effect for real-time data listener.
  // This now uses the imported 'db' instance.
  useEffect(() => {
    if (userId) {
      // Note: The appId and userId are now handled by your `firebase.ts` module
      // and security rules, assuming you have configured them there.
      const collectionPath = `artifacts/${appId}/users/${userId}/data`;
      const q = collection(db, collectionPath);
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const items = [];
          querySnapshot.forEach((docItem) => {
            items.push({ id: docItem.id, ...docItem.data() });
          });
          setData(items);
        },
        (error) => {
          console.error('Error listening to real-time updates:', error);
        }
      );
      return () => unsubscribe();
    }
  }, [userId]);

  const addData = async (value) => {
    if (!userId || !value.trim()) return;
    try {
      const collectionPath = `artifacts/${appId}/users/${userId}/data`;
      await addDoc(collection(db, collectionPath), {
        value: value,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const updateData = async (docId, newValue) => {
    if (!userId || !newValue.trim()) return;
    try {
      const docPath = `artifacts/${appId}/users/${userId}/data/${docId}`;
      await updateDoc(doc(db, docPath), {
        value: newValue.trim(),
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  };

  const deleteData = async (docId) => {
    if (!userId) return;
    try {
      const docPath = `artifacts/${appId}/users/${userId}/data/${docId}`;
      await deleteDoc(doc(db, docPath));
    } catch (e) {
      console.error('Error deleting document: ', e);
    }
  };

  return { isAuthenticated, userId, data, isLoading, addData, updateData, deleteData };
}

// --- Components (Typically in a `src/components` folder) ---

function AppModal({ isVisible, title, message, type, initialValue, onConfirm, onCancel }) {
  const [inputValue, setInputValue] = useState(initialValue || '');

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full space-y-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-gray-700">{message}</p>

        {type === 'input' && (
          <input
            type="text"
            className="w-full text-gray-700 p-2 rounded border border-gray-300"
            defaultValue={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        )}

        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
            Cancel
          </button>
          <button onClick={() => onConfirm(inputValue)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function DataList({ data, updateData, deleteData }) {
  if (data.length === 0) {
    return <p className="text-center text-gray-500">No data found. Add some above!</p>;
  }

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.id} className="bg-gray-100 p-4 rounded-lg shadow flex items-center justify-between">
          <span className="text-gray-800">{item.value}</span>
          <div>
            <button onClick={() => updateData(item.id, item.value)} className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full mr-2 hover:bg-blue-600 transition-colors">
              Update
            </button>
            <button onClick={() => deleteData(item.id)} className="bg-red-500 text-white text-xs px-2 py-1 rounded-full hover:bg-red-600 transition-colors">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Main App Component (Typically in a `src/App.jsx` file) ---

export default function App() {
  const { isAuthenticated, userId, data, isLoading, addData, updateData, deleteData } = useFirestoreData();
  const [inputValue, setInputValue] = useState('');
  const [modal, setModal] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: 'confirm',
    initialValue: '',
    onConfirm: null,
    onCancel: null,
  });

  const handleAddClick = () => {
    if (!inputValue.trim()) {
      setModal({
        isVisible: true,
        title: 'Input Required',
        message: 'Please enter some text to add to the database.',
        type: 'confirm',
        onConfirm: () => setModal((m) => ({ ...m, isVisible: false })),
        onCancel: () => setModal((m) => ({ ...m, isVisible: false })),
      });
      return;
    }
    addData(inputValue);
    setInputValue('');
  };

  const handleUpdateClick = (docId, currentValue) => {
    setModal({
      isVisible: true,
      title: 'Update Item',
      message: 'Enter the new value:',
      type: 'input',
      initialValue: currentValue,
      onConfirm: (newValue) => {
        updateData(docId, newValue);
        setModal((m) => ({ ...m, isVisible: false }));
      },
      onCancel: () => setModal((m) => ({ ...m, isVisible: false })),
    });
  };

  const handleDeleteClick = (docId) => {
    setModal({
      isVisible: true,
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this item?',
      type: 'confirm',
      onConfirm: () => {
        deleteData(docId);
        setModal((m) => ({ ...m, isVisible: false }));
      },
      onCancel: () => setModal((m) => ({ ...m, isVisible: false })),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-2xl font-sans">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 leading-tight">Firestore Real-time Data</h1>
      <p className="text-center text-gray-500 text-lg">Add, update, and delete items in real-time. Data is stored securely in Firebase Firestore.</p>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">User Status</h2>
        <div className="flex items-center text-sm">
          <span className={`h-2.5 w-2.5 rounded-full mr-2 ${isAuthenticated ? 'bg-green-400' : 'bg-red-400'}`}></span>
          <span className="text-gray-600">Status: {isAuthenticated ? 'Authenticated' : 'Authenticating...'}</span>
        </div>
        <p className="text-sm text-gray-600 break-all select-all">User ID: <strong>{userId || 'N/A'}</strong></p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter some data..."
          className="w-full text-gray-700 p-3 rounded-lg shadow-inner border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <button onClick={handleAddClick} className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
          Add Data
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-r-transparent"></div>
        </div>
      ) : (
        <DataList data={data} updateData={handleUpdateClick} deleteData={handleDeleteClick} />
      )}

      <AppModal
        isVisible={modal.isVisible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        initialValue={modal.initialValue}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
      />
    </div>
  );
}


