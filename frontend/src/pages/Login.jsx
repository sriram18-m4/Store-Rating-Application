import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import FormInput from '../components/FormInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(form);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <div className="auth-heading">
          <h1>Store Ratings</h1>
          <p>Sign in</p>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <FormInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <FormInput
            label="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
          {error && <div className="alert error">{error}</div>}
          <button className="primary-button" type="submit" disabled={submitting}>
            <LogIn size={18} />
            <span>{submitting ? 'Signing in' : 'Sign in'}</span>
          </button>
        </form>

        <p className="auth-switch">
          New user? <Link to="/signup">Create account</Link>
        </p>
      </section>
    </main>
  );
}
