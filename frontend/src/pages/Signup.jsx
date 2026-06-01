import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import FormInput from '../components/FormInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validateUserPayload } from '../utils/validation.js';

const emptyForm = {
  name: '',
  email: '',
  address: '',
  password: ''
};

export default function Signup() {
  const { signup, user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateUserPayload(form);
    setErrors(nextErrors);
    setRequestError('');

    if (Object.keys(nextErrors).length) {
      return;
    }

    setSubmitting(true);
    try {
      await signup(form);
    } catch (error) {
      setRequestError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-panel wide">
        <div className="auth-heading">
          <h1>Store Ratings</h1>
          <p>Create account</p>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <FormInput
            label="Name"
            value={form.name}
            error={errors.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <FormInput
            label="Email"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <FormInput
            as="textarea"
            label="Address"
            rows="4"
            value={form.address}
            error={errors.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
            required
          />
          <FormInput
            label="Password"
            type="password"
            value={form.password}
            error={errors.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
          {requestError && <div className="alert error">{requestError}</div>}
          <button className="primary-button" type="submit" disabled={submitting}>
            <UserPlus size={18} />
            <span>{submitting ? 'Creating' : 'Create account'}</span>
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
