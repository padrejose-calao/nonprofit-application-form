// Mock authentication for development
export const mockUsers = [
  {
    id: 1,
    email: 'jose@calao.co',
    password: 'Tecnico123',
    name: 'Jose Rodriguez',
    organization: 'CALAO Corp',
    role: 'admin' as const,
  },
  {
    id: 2,
    email: 'admin@example.com',
    password: 'password123',
    name: 'Admin User',
    organization: 'Test Organization',
    role: 'admin' as const,
  },
  {
    id: 3,
    email: 'user@example.com',
    password: 'password123',
    name: 'Test User',
    organization: 'Sample Nonprofit',
    role: 'user' as const,
  },
];

export const mockLogin = (email: string, password: string) => {
  const user = mockUsers.find((u) => u.email === email && u.password === password);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      user: userWithoutPassword,
    };
  }
  return {
    success: false,
    error: 'Invalid email or password',
  };
};
