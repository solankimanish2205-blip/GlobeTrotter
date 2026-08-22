import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

type Activity = {
  id: number;
  title: string;
  time: string;
};

type Trip = {
  id: number;
  title: string;
  route: string;
  cities: string[];
  dates: string;
  status: string;
  activities: Record<string, Activity[]>;
};

const initialTrips: Trip[] = [
  {
    id: 1,
    title: 'Europe Explorer',
    route: 'Paris · Amsterdam · Rome',
    cities: ['Paris', 'Amsterdam', 'Rome'],
    dates: '12 Jun — 24 Jun',
    status: 'Draft',
    activities: {
      Paris: [{ id: 1, title: 'Arrival and hotel check-in', time: '3:00 PM' }],
      Amsterdam: [],
      Rome: [],
    },
  },
  {
    id: 2,
    title: 'Japan Adventure',
    route: 'Tokyo · Kyoto · Osaka',
    cities: ['Tokyo', 'Kyoto', 'Osaka'],
    dates: '03 Oct — 14 Oct',
    status: 'Planning',
    activities: {
      Tokyo: [],
      Kyoto: [],
      Osaka: [],
    },
  },
];

function App() {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [destination, setDestination] = useState('');
  const [cities, setCities] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) ?? null;

  const openCreateTrip = () => setIsCreateOpen(true);
  const closeCreateTrip = () => setIsCreateOpen(false);

  const openItinerary = (tripId: number) => {
    setSelectedTripId(tripId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeItinerary = () => setSelectedTripId(null);

  const createTrip = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cityList = cities.split(',').map((city) => city.trim()).filter(Boolean);
    const title = destination.trim() || cityList[0] || 'New Adventure';
    const route = cityList.length > 0 ? cityList.join(' · ') : title;
    const dates = startDate && endDate ? `${startDate} — ${endDate}` : 'Dates not set';
    const activities: Record<string, Activity[]> = {};
    cityList.forEach((city) => { activities[city] = []; });
    const newTrip: Trip = {
      id: Date.now(), title, route, cities: cityList.length ? cityList : [title], dates, status: 'Draft', activities,
    };
    setTrips((currentTrips) => [newTrip, ...currentTrips]);
    setDestination(''); setCities(''); setStartDate(''); setEndDate(''); setIsCreateOpen(false);
    setSelectedTripId(newTrip.id);
  };

  const addActivity = (city: string) => {
    const title = window.prompt(`Add an activity for ${city}`)?.trim();
    if (!title) return;
    setTrips((currentTrips) => currentTrips.map((trip) => {
      if (trip.id !== selectedTripId) return trip;
      const current = trip.activities[city] ?? [];
      return { ...trip, activities: { ...trip.activities, [city]: [...current, { id: Date.now(), title, time: 'Flexible' }] } };
    }));
  };

  if (selectedTrip) {
    return (
      <TripWorkspace trip={selectedTrip} onBack={closeItinerary} onAddActivity={addActivity} />
    );
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <a className="brand" href="#top" aria-label="GlobeTrotter home"><span className="brand-mark">✦</span><span>GlobeTrotter</span></a>
        <nav className="nav-links" aria-label="Main navigation"><a href="#trips">My Trips</a><a href="#discover">Discover</a><a href="#about">About</a></nav>
        <button className="profile-button" type="button">MS</button>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">YOUR JOURNEY, YOUR WAY</span>
            <h1>Plan the trip.<br /><em>Live the story.</em></h1>
            <p>Build multi-city journeys, organize every day of your itinerary, and keep your travel plans in one place.</p>
            <div className="hero-actions"><button className="primary-button" type="button" onClick={openCreateTrip}>＋ Create New Trip</button><a className="secondary-button" href="#discover">Explore destinations</a></div>
          </div>
          <div className="hero-card" aria-label="Trip planning preview"><div className="map-orb">✈</div><div className="route-line" /><div className="route-point point-one"><span />Paris</div><div className="route-point point-two"><span />Amsterdam</div><div className="route-point point-three"><span />Rome</div><div className="floating-card"><span className="floating-label">NEXT ADVENTURE</span><strong>Europe Explorer</strong><span>3 cities · 12 days</span></div></div>
        </section>

        <section className="stats" aria-label="GlobeTrotter highlights"><div><strong>Multi-city</strong><span>Trips built around your route</span></div><div><strong>Day by day</strong><span>Organize every part of your itinerary</span></div><div><strong>One place</strong><span>Keep plans and costs together</span></div></section>

        <section className="trips-section" id="trips">
          <div className="section-heading"><div><span className="eyebrow">YOUR PLANS</span><h2>Upcoming adventures</h2></div><button className="text-button" type="button" onClick={openCreateTrip}>＋ New trip</button></div>
          <div className="trip-grid">
            {trips.map((trip) => (
              <article className="trip-card" key={trip.id}>
                <div className="trip-image" aria-hidden="true"><span>✦</span></div>
                <div className="trip-content"><div className="trip-topline"><span className="status">{trip.status}</span><span>{trip.dates}</span></div><h3>{trip.title}</h3><p>{trip.route}</p><button className="card-button" type="button" onClick={() => openItinerary(trip.id)}>Open itinerary →</button></div>
              </article>
            ))}
            <button className="new-trip-card" type="button" onClick={openCreateTrip}><span className="plus-circle">＋</span><strong>Create another trip</strong><span>Start with a destination and we'll build from there.</span></button>
          </div>
        </section>

        <section className="discover-section" id="discover"><div><span className="eyebrow">DISCOVER</span><h2>Where will you go next?</h2></div><p>Search destinations, find experiences, and turn inspiration into your next itinerary.</p></section>
      </main>
      <footer id="about"><span>✦ GlobeTrotter</span><span>Travel planning, simplified.</span></footer>

      {isCreateOpen && <CreateTripModal destination={destination} cities={cities} startDate={startDate} endDate={endDate} setDestination={setDestination} setCities={setCities} setStartDate={setStartDate} setEndDate={setEndDate} onClose={closeCreateTrip} onSubmit={createTrip} />}
    </div>
  );
}

function CreateTripModal(props: {
  destination: string; cities: string; startDate: string; endDate: string;
  setDestination: (value: string) => void; setCities: (value: string) => void; setStartDate: (value: string) => void; setEndDate: (value: string) => void;
  onClose: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={props.onClose}><section className="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-trip-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" type="button" aria-label="Close" onClick={props.onClose}>×</button><span className="eyebrow">NEW ADVENTURE</span><h2 id="create-trip-title">Create your trip</h2><p className="modal-intro">Start with the basics. You can build the day-by-day itinerary next.</p><form onSubmit={props.onSubmit}><label>Trip name / destination<input value={props.destination} onChange={(event) => props.setDestination(event.target.value)} placeholder="e.g. Italy Summer Trip" required /></label><label>Cities <span className="field-hint">comma separated</span><input value={props.cities} onChange={(event) => props.setCities(event.target.value)} placeholder="Rome, Florence, Venice" required /></label><div className="date-grid"><label>Start date<input type="date" value={props.startDate} onChange={(event) => props.setStartDate(event.target.value)} /></label><label>End date<input type="date" value={props.endDate} onChange={(event) => props.setEndDate(event.target.value)} /></label></div><button className="primary-button modal-submit" type="submit">Create trip →</button></form></section></div>;
}

function TripWorkspace({ trip, onBack, onAddActivity }: { trip: Trip; onBack: () => void; onAddActivity: (city: string) => void }) {
  return <div className="workspace-shell"><header className="workspace-header"><button className="back-button" type="button" onClick={onBack}>← My Trips</button><span className="workspace-brand">✦ GlobeTrotter</span><span className="workspace-status">{trip.status}</span></header><main className="workspace-main"><section className="workspace-hero"><div><span className="eyebrow">TRIP WORKSPACE</span><h1>{trip.title}</h1><p>{trip.route} <span>·</span> {trip.dates}</p></div><button className="primary-button" type="button" onClick={() => trip.cities[0] && onAddActivity(trip.cities[0])}>＋ Add activity</button></section><div className="workspace-grid"><aside className="route-panel"><span className="panel-label">YOUR ROUTE</span>{trip.cities.map((city, index) => <div className={`city-stop ${index === 0 ? 'active' : ''}`} key={city}><span className="stop-number">{index + 1}</span><div><strong>{city}</strong><small>{index === 0 ? 'Start of journey' : index === trip.cities.length - 1 ? 'Final stop' : 'Next stop'}</small></div></div>)}</aside><section className="itinerary-panel"><div className="panel-heading"><div><span className="panel-label">DAY BY DAY</span><h2>Your itinerary</h2></div><span className="day-count">{trip.cities.length} stops</span></div>{trip.cities.map((city, index) => <article className="day-card" key={city}><div className="day-marker"><span>DAY</span><strong>{index + 1}</strong></div><div className="day-body"><div className="day-title"><div><span className="city-label">{city}</span><h3>{index === 0 ? 'Arrival & explore' : `Explore ${city}`}</h3></div><button type="button" onClick={() => onAddActivity(city)}>＋ Add activity</button></div>{(trip.activities[city] ?? []).length === 0 ? <div className="empty-activity">No activities yet. Add something to make this day yours.</div> : <div className="activity-list">{trip.activities[city].map((activity) => <div className="activity-item" key={activity.id}><span>○</span><div><strong>{activity.title}</strong><small>{activity.time}</small></div></div>)}</div>}</div></article>)}</section></div></main></div>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
