import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navigation from './Navigation';

describe('Navigation', () => {
  it('renders owner links for owner role', () => {
    const authContextValue = {
      user: { role: 'owner' },
      signOut: () => {},
    };

    render(
      <AuthContext.Provider value={authContextValue as any}>
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Floor Layout')).toBeInTheDocument();
    expect(screen.getByText('Menu Editor')).toBeInTheDocument();
  });
});
