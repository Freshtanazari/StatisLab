import { render, screen } from '@testing-library/react';
import App from './App';

test('renders landing page headline', () => {
  render(<App />);
  const heading = screen.getByText(/Turn raw datasets into cleaned outputs/i);
  expect(heading).toBeInTheDocument();
});
