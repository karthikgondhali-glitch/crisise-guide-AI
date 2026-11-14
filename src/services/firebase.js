import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser() {
  await signOut(auth);
}

export { onAuthStateChanged };

function sanitizeId(raw) {
  return String(raw || '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 128);
}

export async function saveSimulationToCloud(simulation, notes = '') {
  const user = auth.currentUser;
  if (!user) return null;

  const simId = sanitizeId(`sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  const path = `simulations/${simId}`;

  const ownerId = sanitizeId(user.uid);
  const scenario = String(simulation.scenario || 'Flood').slice(0, 64);
  const supply = Math.max(0, Math.min(10000, Number(simulation.supply || 0)));
  const totalDemand = Math.max(0, Math.min(10000, Number(simulation.total_demand || 0)));
  const safe = Boolean(simulation.safe);
  const statusMessage = String(
    simulation.status_message || (safe ? 'Safe Allocation Achieved' : 'No Safe Allocation Possible')
  ).slice(0, 160);

  const alloc = simulation.allocation || {};
  const hospitalAllocated = Math.max(0, Math.min(10000, Number(alloc.Hospital || 0)));
  const waterAllocated = Math.max(0, Math.min(10000, Number(alloc.Water || 0)));
  const emergencyAllocated = Math.max(0, Math.min(10000, Number(alloc.Emergency || 0)));
  const telecomAllocated = Math.max(0, Math.min(10000, Number(alloc.Telecom || 0)));

  const payload = {
    ownerId,
    scenario,
    supply,
    totalDemand,
    safe,
    statusMessage,
    hospitalAllocated,
    waterAllocated,
    emergencyAllocated,
    telecomAllocated,
    notes: String(notes || '').slice(0, 300),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'simulations', simId), payload);
    return simId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateSimulationNotes(simId, notes) {
  const cleanId = sanitizeId(simId);
  const path = `simulations/${cleanId}`;
  try {
    await updateDoc(doc(db, 'simulations', cleanId), {
      notes: String(notes || '').slice(0, 300),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteSimulationFromCloud(simId) {
  const cleanId = sanitizeId(simId);
  const path = `simulations/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'simulations', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToUserSimulations(uid, onUpdate) {
  if (!uid) return () => {};
  const path = 'simulations';
  const q = query(collection(db, path), where('ownerId', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      items.sort((a, b) => {
        const tA = a.createdAt?.seconds || 0;
        const tB = b.createdAt?.seconds || 0;
        return tB - tA;
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
