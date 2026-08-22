import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

const trips = [
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
              <button className="primary-button" type="button">＋ Create New Trip</button>
              <button className="secondary-button" type="button">Explore destinations</button>
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
            <button className="text-button" type="button">View all →</button>
          </div>

          <div className="trip-grid">
            {trips.map((trip) => (
              <article className="trip-card" key={trip.title}>
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

            <button className="new-trip-card" type="button">
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
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
