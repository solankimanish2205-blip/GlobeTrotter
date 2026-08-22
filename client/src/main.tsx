import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

type Trip = {
  title: string;
  route: string;
  dates: string;
  status: string;
};

const initialTrips: Trip[] = [
  {
    title: 'Europe Explorer',
    route: 'Paris · Amsterdam · Rome',
    dates: '12 Jun — 24 Jun',
    status: 'Draft',
  },
  {
    title: 'Japan Adventure',
    route: 'Tokyo · Kyoto · Osaka',
    dates: '03 Oct — 14 Oct',
    status: 'Planning',
  },
];

function App() {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [destination, setDestination] = useState('');
  const [cities, setCities] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const openCreateTrip = () => setIsCreateOpen(true);
  const closeCreateTrip = () => setIsCreateOpen(false);

  const createTrip = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cityList = cities
      .split(',')
      .map((city) => city.trim())
      .filter(Boolean);

    const title = destination.trim() || cityList[0] || 'New Adventure';
    const route = cityList.length > 0 ? cityList.join(' · ') : title;
    const dates = startDate && endDate ? `${startDate} — ${endDate}` : 'Dates not set';

    setTrips((currentTrips) => [
      { title, route, dates, status: 'Draft' },
      ...currentTrips,
    ]);

    setDestination('');
    setCities('');
    setStartDate('');
    setEndDate('');
    setIsCreateOpen(false);
  };

  return (
    <div className="app-shell">
      <header className="navbar">
        <a className="brand" href="#top" aria-label="GlobeTrotter home">
          <span className="brand-mark">✦</span>
          <span>GlobeTrotter</span>
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#trips">My Trips</a>
          <a href="#discover">Discover</a>
          <a href="#about">About</a>
        </nav>
        <button className="profile-button" type="button">MS</button>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">YOUR JOURNEY, YOUR WAY</span>
            <h1>Plan the trip.<br /><em>Live the story.</em></h1>
            <p>
              Build multi-city journeys, organize every day of your itinerary,
              and keep your travel plans in one place.
            </p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={openCreateTrip}>＋ Create New Trip</button>
              <a className="secondary-button" href="#discover">Explore destinations</a>
            </div>
          </div>
          <div className="hero-card" aria-label="Trip planning preview">
            <div className="map-orb">✈</div>
            <div className="route-line" />
            <div className="route-point point-one"><span />Paris</div>
            <div className="route-point point-two"><span />Amsterdam</div>
            <div className="route-point point-three"><span />Rome</div>
            <div className="floating-card">
              <span className="floating-label">NEXT ADVENTURE</span>
              <strong>Europe Explorer</strong>
              <span>3 cities · 12 days</span>
            </div>
          </div>
        </section>

        <section className="stats" aria-label="GlobeTrotter highlights">
          <div><strong>Multi-city</strong><span>Trips built around your route</span></div>
          <div><strong>Day by day</strong><span>Organize every part of your itinerary</span></div>
          <div><strong>One place</strong><span>Keep plans and costs together</span></div>
        </section>

        <section className="trips-section" id="trips">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR PLANS</span>
              <h2>Upcoming adventures</h2>
            </div>
            <button className="text-button" type="button" onClick={openCreateTrip}>＋ New trip</button>
          </div>

          <div className="trip-grid">
            {trips.map((trip, index) => (
              <article className="trip-card" key={`${trip.title}-${index}`}>
                <div className="trip-image" aria-hidden="true"><span>✦</span></div>
                <div className="trip-content">
                  <div className="trip-topline">
                    <span className="status">{trip.status}</span>
                    <span>{trip.dates}</span>
                  </div>
                  <h3>{trip.title}</h3>
                  <p>{trip.route}</p>
                  <button className="card-button" type="button">Open itinerary →</button>
                </div>
              </article>
            ))}

            <button className="new-trip-card" type="button" onClick={openCreateTrip}>
              <span className="plus-circle">＋</span>
              <strong>Create another trip</strong>
              <span>Start with a destination and we'll build from there.</span>
            </button>
          </div>
        </section>

        <section className="discover-section" id="discover">
          <div>
            <span className="eyebrow">DISCOVER</span>
            <h2>Where will you go next?</h2>
          </div>
          <p>Search destinations, find experiences, and turn inspiration into your next itinerary.</p>
        </section>
      </main>

      <footer id="about">
        <span>✦ GlobeTrotter</span>
        <span>Travel planning, simplified.</span>
      </footer>

      {isCreateOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeCreateTrip}>
          <section
            className="create-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-trip-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" aria-label="Close" onClick={closeCreateTrip}>×</button>
            <span className="eyebrow">NEW ADVENTURE</span>
            <h2 id="create-trip-title">Create your trip</h2>
            <p className="modal-intro">Start with the basics. You can build the day-by-day itinerary next.</p>

            <form onSubmit={createTrip}>
              <label>
                Trip name / destination
                <input
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="e.g. Italy Summer Trip"
                  required
                />
              </label>

              <label>
                Cities <span className="field-hint">comma separated</span>
                <input
                  value={cities}
                  onChange={(event) => setCities(event.target.value)}
                  placeholder="Rome, Florence, Venice"
                  required
                />
              </label>

              <div className="date-grid">
                <label>
                  Start date
                  <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                </label>
                <label>
                  End date
                  <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
                </label>
              </div>

              <button className="primary-button modal-submit" type="submit">Create trip →</button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
