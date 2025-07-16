import { useEffect, useState } from 'react';

function CalendarApp() {
    const [events, setEvents] = useState([]);
    const [authenticated, setAuthenticated] = useState(false);

    const fetchEvents = async () => {
        try {
            const res = await fetch('http://localhost:5000/events');
            if (res.status === 401) {
                setAuthenticated(false);
                return;
            }
            const data = await res.json();
            console.log(data)
            const filtered = (data.items || []).filter(ev => ev.status !== 'cancelled');
            setEvents(filtered);
            setAuthenticated(true);
        } catch (err) {
            console.error(err);
        }
    };

    const login = async () => {
        const res = await fetch('http://localhost:5000/auth-url');
        const { url } = await res.json();
        window.open(url, '_blank');
    };

    useEffect(() => {
        fetchEvents();
        const interval = setInterval(fetchEvents, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
  <div style={{ fontFamily: 'Arial, sans-serif', padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
    <h2 style={{ fontSize: '1.8rem', color: '#333', marginBottom: '1rem' }}>Your Google Calendar Events</h2>

    {!authenticated && (
      <button
        onClick={login}
        style={{
          padding: '10px 20px',
          fontSize: '1rem',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: '#4285F4',
          color: '#fff',
          cursor: 'pointer'
        }}
      >
        🔐 Login with Google
      </button>
    )}

    {authenticated && (
      <>
        {events.length === 0 ? (
          <p style={{ color: '#888' }}>No upcoming events.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {events.map(ev => (
              <li key={ev.id} style={{
                marginBottom: '1rem',
                padding: '1rem',
                backgroundColor: '#f1f3f4',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <strong style={{ fontSize: '1.1rem', color: '#202124' }}>{ev.summary}</strong><br />
                <span style={{ color: '#555' }}>
                  {ev.start.dateTime || ev.start.date}
                </span>
              </li>
            ))}
          </ul>
        )}
      </>
    )}
  </div>
);

}

export default CalendarApp;
