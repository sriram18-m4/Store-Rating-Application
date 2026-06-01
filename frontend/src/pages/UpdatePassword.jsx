import { useState } from 'react';
import { Save } from 'lucide-react';
import FormInput from '../components/FormInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { messages, validatePassword } from '../utils/validation.js';

export default function UpdatePassword() {
  const { updatePassword } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!validatePassword(form.newPassword)) {
      setError(messages.password);
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword(form);
      setSuccess('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '' });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-section compact">
      <div className="section-heading">
        <h1>Password</h1>
      </div>

      <form className="panel stack" onSubmit={handleSubmit}>
        <FormInput
          label="Current password"
          type="password"
          value={form.currentPassword}
          onChange={(event) => setForm({ ...form, currentPassword: event.target.value })}
          required
        />
        <FormInput
          label="New password"
          type="password"
          value={form.newPassword}
          onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
          required
        />
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}
        <button className="primary-button" type="submit" disabled={submitting}>
          <Save size={18} />
          <span>{submitting ? 'Saving' : 'Save'}</span>
        </button>
      </form>
    </section>
  );
}
