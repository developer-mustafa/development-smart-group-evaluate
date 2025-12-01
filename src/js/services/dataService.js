// js/services/dataService.js
import { db, serverTimestamp } from '../config/firebase.js';
import cacheManager from '../managers/cacheManager.js';

// --- Configuration ---
const CACHE_KEYS = {
  GROUPS: 'groups_data',
  STUDENTS: 'students_data',
  TASKS: 'tasks_data',
  EVALUATIONS: 'evaluations_data',
  ADMINS: 'admins_data',
};
const DEFAULT_CACHE_DURATION_MINUTES = 5;

// --- Local Utility Helpers ---
function normalizeString(value) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value).trim();
  return '';
}

function normalizeName(value) {
  const normalized = normalizeString(value);
  return normalized ? normalized.toLowerCase() : '';
}

function hasCachedNameConflict(cacheKey, normalizedName, excludeId = null) {
  if (!normalizedName) return false;
  const cached = cacheManager.get(cacheKey);
  if (!Array.isArray(cached) || cached.length === 0) return false;
  return cached.some((item) => {
    if (!item || (excludeId && item.id === excludeId)) return false;
    const candidate =
      typeof item.nameLower === 'string' && item.nameLower
        ? item.nameLower
        : normalizeName(item.name);
    return candidate === normalizedName;
  });
}

// --- Generic Helper Functions ---
async function loadData(collectionName, cacheKey, options = {}) {
  const cachedData = cacheManager.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  try {
    let query = db.collection(collectionName);
    if (options.orderByField) {
      query = query.orderBy(options.orderByField, options.orderByDirection || 'asc');
    }
    const snapshot = await query.get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    cacheManager.set(cacheKey, data, DEFAULT_CACHE_DURATION_MINUTES);
    return data;
  } catch (error) {
    console.error(`❌ Error loading ${collectionName}:`, error);
    throw new Error(`Failed to load ${collectionName}. Check connection/permissions.`);
  }
}

async function addDocument(collectionName, data, cacheKey) {
  try {
    const docRef = await db.collection(collectionName).add({
      ...data,
      createdAt: serverTimestamp(),
    });
    cacheManager.clear(cacheKey);
    console.log(`✅ Document added to ${collectionName} (${docRef.id})`);
    return docRef.id;
  } catch (error) {
    console.error(`❌ Error adding document to ${collectionName}:`, error);
    throw new Error(`Failed to add item to ${collectionName}.`);
  }
}

async function updateDocument(collectionName, docId, data, cacheKey) {
  if (!docId) throw new Error('Document ID required for update.');
  try {
    await db
      .collection(collectionName)
      .doc(docId)
      .update({
        ...data,
        updatedAt: serverTimestamp(),
      });
    cacheManager.clear(cacheKey);
    console.log(`✅ Document updated in ${collectionName} (${docId})`);
    if (collectionName === 'admins') {
      cacheManager.clear(`admin_${docId}`);
    }
  } catch (error) {
    console.error(`❌ Error updating document ${docId} in ${collectionName}:`, error);
    throw new Error(`Failed to update item in ${collectionName}.`);
  }
}

async function deleteDocument(collectionName, docId, cacheKey) {
  if (!docId) throw new Error('Document ID required for deletion.');
  try {
    await db.collection(collectionName).doc(docId).delete();
    cacheManager.clear(cacheKey);
    console.log(`✅ Document deleted from ${collectionName} (${docId})`);
    if (collectionName === 'admins') {
      cacheManager.clear(`admin_${docId}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting document ${docId} in ${collectionName}:`, error);
    throw new Error(`Failed to delete item from ${collectionName}.`);
  }
}

// --- Backup & Restore Helpers ---

export async function restoreCollection(collectionName, dataArray) {
  if (!Array.isArray(dataArray) || dataArray.length === 0) return;

  const batchSize = 450; // Firestore limit is 500
  const chunks = [];
  
  for (let i = 0; i < dataArray.length; i += batchSize) {
    chunks.push(dataArray.slice(i, i + batchSize));
  }

  console.log(`Starting restore for ${collectionName}: ${dataArray.length} items in ${chunks.length} batches.`);

  for (const chunk of chunks) {
    const batch = db.batch();
    chunk.forEach((item) => {
      if (!item.id) return; // Skip invalid items
      const docRef = db.collection(collectionName).doc(item.id);
      // Use merge: true to update existing or create new, preserving other fields if any
      batch.set(docRef, { ...item, updatedAt: serverTimestamp() }, { merge: true });
    });

    try {
      await batch.commit();
      console.log(`✅ Restored batch of ${chunk.length} items to ${collectionName}`);
    } catch (error) {
      console.error(`❌ Error restoring batch to ${collectionName}:`, error);
      throw new Error(`Failed to restore data to ${collectionName}.`);
    }
  }
  
  // Clear cache for this collection
  const cacheKeyMap = {
    groups: CACHE_KEYS.GROUPS,
    students: CACHE_KEYS.STUDENTS,
    tasks: CACHE_KEYS.TASKS,
    evaluations: CACHE_KEYS.EVALUATIONS,
    admins: CACHE_KEYS.ADMINS,
  };
  if (cacheKeyMap[collectionName]) {
    cacheManager.clear(cacheKeyMap[collectionName]);
  }
}

export async function clearCollection(collectionName) {
  // CAUTION: This deletes all documents in a collection.
  // Firestore doesn't have a native "delete collection" method for web clients,
  // so we must fetch and delete in batches.
  try {
    const snapshot = await db.collection(collectionName).get();
    if (snapshot.empty) return;

    const batchSize = 450;
    const docs = snapshot.docs;
    const chunks = [];

    for (let i = 0; i < docs.length; i += batchSize) {
      chunks.push(docs.slice(i, i + batchSize));
    }

    console.log(`Clearing ${collectionName}: ${docs.length} items...`);

    for (const chunk of chunks) {
      const batch = db.batch();
      chunk.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }
    
    console.log(`✅ Cleared collection ${collectionName}`);
    
    // Clear cache
    const cacheKeyMap = {
      groups: CACHE_KEYS.GROUPS,
      students: CACHE_KEYS.STUDENTS,
      tasks: CACHE_KEYS.TASKS,
      evaluations: CACHE_KEYS.EVALUATIONS,
      admins: CACHE_KEYS.ADMINS,
    };
    if (cacheKeyMap[collectionName]) {
      cacheManager.clear(cacheKeyMap[collectionName]);
    }

  } catch (error) {
    console.error(`❌ Error clearing collection ${collectionName}:`, error);
    throw new Error(`Failed to clear ${collectionName}.`);
  }
}

// --- Specific Data Functions ---

// Groups
export const loadGroups = () => loadData('groups', CACHE_KEYS.GROUPS, { orderByField: 'name' });
export const addGroup = (data = {}) => {
  const name = normalizeString(data.name);
  if (!name) throw new Error('Group name is required.');
  const payload = { ...data, name, nameLower: normalizeName(name) };
  return addDocument('groups', payload, CACHE_KEYS.GROUPS);
};
export const updateGroup = (id, data = {}) => {
  if (!id) throw new Error('Group ID required for update.');
  const payload = { ...data };
  if (Object.prototype.hasOwnProperty.call(data, 'name')) {
    const name = normalizeString(data.name);
    if (!name) throw new Error('Group name cannot be empty.');
    payload.name = name;
    payload.nameLower = normalizeName(name);
  }
  return updateDocument('groups', id, payload, CACHE_KEYS.GROUPS);
};
export const deleteGroup = (id) => deleteDocument('groups', id, CACHE_KEYS.GROUPS);

// Students
export const loadStudents = () => loadData('students', CACHE_KEYS.STUDENTS, { orderByField: 'name' });
export const addStudent = (data) => addDocument('students', data, CACHE_KEYS.STUDENTS);
export const updateStudent = (id, data) => updateDocument('students', id, data, CACHE_KEYS.STUDENTS);
export const batchUpdateStudents = async (studentIds, updateData) => {
  if (!studentIds || studentIds.length === 0) return;
  const batch = db.batch();
  studentIds.forEach((id) => {
    const studentRef = db.collection('students').doc(id);
    batch.update(studentRef, { ...updateData, updatedAt: serverTimestamp() });
  });
  try {
    await batch.commit();
    cacheManager.clear(CACHE_KEYS.STUDENTS);
    console.log(`✅ Batch updated ${studentIds.length} students.`);
  } catch (error) {
    console.error('❌ Error batch updating students:', error);
    throw new Error('Failed to update student group assignments.');
  }
};
export const deleteStudent = (id) => deleteDocument('students', id, CACHE_KEYS.STUDENTS);

// Tasks
export const loadTasks = () => loadData('tasks', CACHE_KEYS.TASKS, { orderByField: 'date', orderByDirection: 'desc' });
export const addTask = (data = {}) => {
  const name = normalizeString(data.name);
  if (!name) throw new Error('Task name is required.');
  const payload = { ...data, name, nameLower: normalizeName(name) };
  return addDocument('tasks', payload, CACHE_KEYS.TASKS);
};
export const updateTask = (id, data = {}) => {
  if (!id) throw new Error('Task ID required for update.');
  const payload = { ...data };
  if (Object.prototype.hasOwnProperty.call(data, 'name')) {
    const name = normalizeString(data.name);
    if (!name) throw new Error('Task name cannot be empty.');
    payload.name = name;
    payload.nameLower = normalizeName(name);
  }
  return updateDocument('tasks', id, payload, CACHE_KEYS.TASKS);
};
export const deleteTask = (id) => deleteDocument('tasks', id, CACHE_KEYS.TASKS);

// Evaluations
export const loadEvaluations = () =>
  loadData('evaluations', CACHE_KEYS.EVALUATIONS, { orderByField: 'taskDate', orderByDirection: 'desc' });
export const addEvaluation = (data) => addDocument('evaluations', data, CACHE_KEYS.EVALUATIONS);
export const updateEvaluation = (id, data) => updateDocument('evaluations', id, data, CACHE_KEYS.EVALUATIONS);
export const deleteEvaluation = (id) => deleteDocument('evaluations', id, CACHE_KEYS.EVALUATIONS);
export const batchDeleteEvaluations = async (evaluationIds) => {
  if (!evaluationIds || evaluationIds.length === 0) return;
  const batch = db.batch();
  evaluationIds.forEach((id) => {
    const evalRef = db.collection('evaluations').doc(id);
    batch.delete(evalRef);
  });
  try {
    await batch.commit();
    cacheManager.clear(CACHE_KEYS.EVALUATIONS);
    console.log(`✅ Batch deleted ${evaluationIds.length} evaluations.`);
  } catch (error) {
    console.error('❌ Error batch deleting evaluations:', error);
    throw new Error('Failed to delete associated evaluations.');
  }
};
export async function getEvaluationById(id) {
  if (!id) throw new Error('Evaluation ID is required.');
  try {
    const doc = await db.collection('evaluations').doc(id).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    } else {
      console.warn(`Evaluation with ID ${id} not found.`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching evaluation ${id}:`, error);
    throw new Error('Failed to fetch evaluation details.');
  }
}

// Admins
export const loadAdmins = () => loadData('admins', CACHE_KEYS.ADMINS, { orderByField: 'email' });
export const updateAdmin = (id, data) => updateDocument('admins', id, data, CACHE_KEYS.ADMINS);
export const deleteAdmin = (id) => deleteDocument('admins', id, CACHE_KEYS.ADMINS);
export async function getAdminData(userId) {
  if (!userId) {
    console.warn('getAdminData called without userId');
    return null;
  }
  const cacheKey = `admin_${userId}`;
  const cached = cacheManager.get(cacheKey);
  if (cached) return cached;
  try {
    const doc = await db.collection('admins').doc(userId).get();
    if (doc.exists) {
      const data = { id: doc.id, ...doc.data() };
      cacheManager.set(cacheKey, data, 15); // Cache admin data for 15 mins
      return data;
    } else {
      return null; // Let auth service handle creation
    }
  } catch (error) {
    console.error(`❌ Error fetching admin data for user ${userId}:`, error);
    return null;
  }
}

// --- Specific Queries ---
export async function checkStudentUniqueness(roll, academicGroup, excludeId = null) {
  const normalizedRoll = normalizeString(roll);
  const normalizedGroup = normalizeString(academicGroup);
  if (!normalizedRoll || !normalizedGroup) {
    throw new Error('Roll and Academic Group required.');
  }
  try {
    let query = db
      .collection('students')
      .where('roll', '==', normalizedRoll)
      .where('academicGroup', '==', normalizedGroup)
      .limit(1);
    const snapshot = await query.get();
    if (snapshot.empty) return false;
    if (excludeId && snapshot.docs[0].id === excludeId) return false;
    return true;
  } catch (error) {
    console.error('❌ Error checking student uniqueness:', error);
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      console.error('Firestore composite index missing: students(roll ASC, academicGroup ASC).');
      throw new Error('ডাটাবেস কনফিগারেশন প্রয়োজন (Student Index missing)।');
    }
    throw new Error('Failed to check duplicate students.');
  }
}

export const checkGroupNameExists = async (name, excludeId = null) => {
  const normalizedName = normalizeName(name);
  if (!normalizedName) return false;
  if (hasCachedNameConflict(CACHE_KEYS.GROUPS, normalizedName, excludeId)) {
    return true;
  }
  try {
    // Requires Firestore index: groups / nameLower ASC
    let query = db.collection('groups').where('nameLower', '==', normalizedName).limit(1);
    const snapshot = await query.get();
    if (snapshot.empty) return false;
    if (excludeId && snapshot.docs[0].id === excludeId) return false;
    return true;
  } catch (error) {
    console.error('❌ Error checking group name uniqueness:', error);
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      console.error('Firestore index missing: groups(nameLower ASC).');
      throw new Error('ডাটাবেস কনফিগারেশন প্রয়োজন (Group Index missing)।');
    }
    throw new Error('Failed to check duplicate group name.');
  }
};

/**
 * Checks if a task name exists (case-insensitive, using 'nameLower' field).
 * Requires Firestore index on 'nameLower'.
 * @param {string} name - The task name to check.
 * @param {string|null} [excludeId=null] - Optional task ID to exclude (for updates).
 * @returns {Promise<boolean>} - True if the name exists for a different task, false otherwise.
 */
export const checkTaskNameExists = async (name, excludeId = null) => {
  // <-- ADDED THIS FUNCTION
  const normalizedName = normalizeName(name);
  if (!normalizedName) return false;
  if (hasCachedNameConflict(CACHE_KEYS.TASKS, normalizedName, excludeId)) {
    return true;
  }
  try {
    // Requires Firestore index: tasks / nameLower ASC
    let query = db.collection('tasks').where('nameLower', '==', normalizedName).limit(1);
    const snapshot = await query.get();
    if (snapshot.empty) return false;
    if (excludeId && snapshot.docs[0].id === excludeId) return false;
    return true;
  } catch (error) {
    console.error('❌ Error checking task name uniqueness:', error);
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      console.error('Firestore index missing: tasks(nameLower ASC).');
      throw new Error('ডাটাবেস কনফিগারেশন প্রয়োজন (Task Index missing)।');
    }
    throw new Error('টাস্কের নাম যাচাই করতে সমস্যা হয়েছে।');
  }
};
