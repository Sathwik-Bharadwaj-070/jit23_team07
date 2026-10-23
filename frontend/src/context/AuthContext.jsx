import { createContext, useContext, useState } from 'react';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../utils/auth';
const AuthContext = createContext(null);
export function AuthProvider({
  children
}) {
  const [user, setUser] = useState(getCurrentUser());
  function login(email, password) {
    const session = loginUser(email, password);
    if (session) setUser(session);
    return session;
  }
  function register(details) {
    return registerUser(details);
  }
  function logout() {
    logoutUser();
    setUser(null);
  }
  return <AuthContext.Provider value={{
    user,
    login,
    register,
    logout
  }}>
      {children}
    </AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
