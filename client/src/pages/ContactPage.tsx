import { useState, type FormEvent } from 'react';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SEOHead } from '../components/seo/SEOHead';
import { submitContact } from '../api/contact';
import { FetchError } from '../api/client';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await submitContact({ name, email, subject, message });
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err instanceof FetchError ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Contact" description="Get in touch with us" />
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Contact Us</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Have a question or feedback? We'd love to hear from you.
        </p>

        {success ? (
          <Card>
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Message Sent!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Thank you for reaching out. We'll get back to you soon.</p>
              <Button variant="secondary" onClick={() => setSuccess(false)}>
                Send Another Message
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
              <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} required />
              <Button type="submit" loading={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}
