const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const HISTORY_KEY = 'predictionHistory';
const ADMIN_EMAIL = 'admin@agrivision.ai';
const ADMIN_PASSWORD = 'Admin@123';
export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
export function registerUser({
  name,
  email,
  password
}) {
  const users = getUsers();
  if (email.toLowerCase() === ADMIN_EMAIL) {
    throw new Error('That email is reserved. Please use a different one.');
  }
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with that email already exists.');
  }
  const newUser = {
    name,
    email,
    password,
    role: 'user',
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}
export function loginUser(email, password) {
  if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const adminSession = {
      name: 'Admin',
      email: ADMIN_EMAIL,
      role: 'admin'
    };
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminSession));
    return adminSession;
  }
  const users = getUsers();
  const match = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!match) return null;
  const session = {
    name: match.name,
    email: match.email,
    role: 'user'
  };
  sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session));
  return session;
}
export function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY));
  } catch {
    return null;
  }
}
export function logoutUser() {
  sessionStorage.removeItem(CURRENT_USER_KEY);
}
export function deleteUser(email) {
  const users = getUsers().filter(u => u.email.toLowerCase() !== email.toLowerCase());
  saveUsers(users);
}
export function getPredictionHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}
export function logPrediction(entry) {
  const history = getPredictionHistory();
  history.unshift({
    ...entry,
    loggedAt: new Date().toISOString()
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 200)));
}
