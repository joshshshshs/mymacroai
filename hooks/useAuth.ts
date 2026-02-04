// Re-export useAuth from AuthContext for backward compatibility
// This shim exists because app/(auth)/*.tsx files import from '../../hooks/useAuth'
export { useAuth } from '../contexts/AuthContext';
export type { SignUpData, SignInData } from '../services/auth/AuthService';
