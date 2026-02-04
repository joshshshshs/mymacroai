// Re-export useAuth from AuthContext
// This file exists for backward compatibility with existing imports
export { useAuth } from '../../contexts/AuthContext';
export type { SignUpData, SignInData } from '../services/auth/AuthService';
