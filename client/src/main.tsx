import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

type Activity = {
  id: number;
  title: string;
  time: string;
  location: string;
  duration: string;
  notes: string;
};

type Trip = {
  id: number;
  title: string;
  route: string;
  cities: string[];
  startDate: string;
  endDate: string;
  status: string;
  activities: Record<string, Activity[]>;
};

type DayPlan = {
  key: string;
  date: string;
  city: string;
  dayNumber: number;
};

const initialTrips: Trip[] = [
  {
    id: 1,
    title: 'Europe Explorer',
    route: 'Paris · Amsterdam · Rome',
    cities: ['Paris', 'Amsterdam', 'Rome'],
    startDate: '2026-06-12',
    endDate: '2026-06-24',
    status: 'Draft',
    activities: {
      Paris: [{ id: 1, title: 'Arrival and hotel check-in', time: '3:00 PM', location: 'Paris', duration: '1 hour', notes: '' }],
      Amsterdam: [],
      Rome: [],
    },
  },
  {
    id: 2,
    title: 'Japan Adventure',
    route: 'Tokyo · Kyoto · Osaka',
    cities: ['Tokyo', 'Kyoto', 'Osaka'],
    startDate: '2026-10-03',
    endDate: '2026-10-14',
    status: 'Planning',
    activities: { Tokyo: [], Kyoto: [], Osaka: [] },
  },
];

const formatDate = (value: string) => {
  if (!value) return 'Date not set';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
};

const formatShortDate = (value: string) => {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(`${value}T00:00:00`));
};

const dateRange = (startDate: string, endDate: string) => {
  if (!startDate || !endDate || startDate > endDate) return [] as string[];
  const dates: string[] = [];
  const current = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const buildDayPlans = (trip: Trip): DayPlan[] => {
  const dates = dateRange(trip.startDate, trip.endDate);
  if (!dates.length) return trip.cities.map((city, index) => ({ key: `${trip.id}-${index}`, date: '', city, dayNumber: index + 1 }));
  const cityCount = Math.max(trip.cities.length, 1);
  return dates.map((date, index) => {
    const cityIndex = Math.min(Math.floor((index * cityCount) / dates.length), cityCount - 1);
    return { key: `${trip.id}-${date}`, date, city: trip.cities[cityIndex] ?? trip.title, dayNumber: index + 1 };
  });
};

function App() {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [destination, setDestination] = useState('');
  const [cities, setCities] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activityForm, setActivityForm] = useState<{ city: string; date: string } | null>(null);

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) ?? null;

  const openCreateTrip = () => setIsCreateOpen(true);
  const closeCreateTrip = () => setIsCreateOpen(false);
  const openItinerary = (tripId: number) => { setSelectedTripId(tripId); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const closeItinerary = () => { setSelectedTripId(null); setActivityForm(null); };

  const createTrip = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cityList = cities.split(',').map((city) => city.trim()).filter(Boolean);
    const title = destination.trim() || cityList[0] || 'New Adventure';
    const activities: Record<string, Activity[]> = {};
    cityList.forEach((city) => { activities[city] = []; });
    const newTrip: Trip = {
      id: Date.now(), title, route: cityList.length ? cityList.join(' · ') : title,
      cities: cityList.length ? cityList : [title], startDate, endDate, status: 'Draft', activities,
    };
    setTrips((current) => [newTrip, ...current]);
    setDestination(''); setCities(''); setStartDate(''); setEndDate(''); setIsCreateOpen(false); setSelectedTripId(newTrip.id);
  };

  const openActivityForm = (city: string, date: string) => setActivityForm({ city, date });

  const addActivity = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTrip || !activityForm) return;
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') || '').trim();
    if (!title) return;
    const activity: Activity = {
      id: Date.now(), title, time: String(form.get('time') || 'Flexible'), location: String(form.get('location') || ''),
      duration: String(form.get('duration') || ''), notes: String(form.get('notes') || ''),
    };
    setTrips((current) => current.map((trip) => trip.id !== selectedTrip.id ? trip : {
      ...trip, activities: { ...trip.activities, [activityForm.city]: [...(trip.activities[activityForm.city] ?? []), activity] },
    }));
    setActivityForm(null);
  };

  if (selectedTrip) {
    return <TripWorkspace trip={selectedTrip} onBack={closeItinerary} onAddActivity={openActivityForm} activityForm={activityForm} onActivitySubmit={addActivity} onCloseActivity={() => setActivityForm(null)} />;
  }

  return (
    <div className="app-shell">
      <header className="navbar"><a className="brand" href="#top" aria-label="GlobeTrotter home"><span className="brand-mark">✦</span><span>GlobeTrotter</span></a><nav className="nav-links" aria-label="Main navigation"><a href="#trips">My Trips</a><a href="#discover">Discover</a><a href="#about">About</a></nav><button className="profile-button" type="button">MS</button></header>
      <main id="top">
        <section className="hero"><div className="hero-copy"><span className="eyebrow">YOUR JOURNEY, YOUR WAY</span><h1>Plan the trip.<br /><em>Live the story.</em></h1><p>Build multi-city journeys, organize every day of your itinerary, and keep your travel plans in one place.</p><div className="hero-actions"><button className="primary-button" type="button" onClick={openCreateTrip}>＋ Create New Trip</button><a className="secondary-button" href="#discover">Explore destinations</a></div></div><div className="hero-card" aria-label="Trip planning preview"><div className="map-orb">✈</div><div className="route-line" /><div className="route-point point-one"><span />Paris</div><div className="route-point point-two"><span />Amsterdam</div><div className="route-point point-three"><span />Rome</div><div className="floating-card"><span className="floating-label">NEXT ADVENTURE</span><strong>Europe Explorer</strong><span>3 cities · 12 days</span></div></div></section>
        <section className="stats"><div><strong>Multi-city</strong><span>Trips built around your route</span></div><div><strong>Day by day</strong><span>Organize every part of your itinerary</span></div><div><strong>One place</strong><span>Keep plans and costs together</span></div></section>
        <section className="trips-section" id="trips"><div className="section-heading"><div><span className="eyebrow">YOUR PLANS</span><h2>Upcoming adventures</h2></div><button className="text-button" type="button" onClick={openCreateTrip}>＋ New trip</button></div><div className="trip-grid">{trips.map((trip) => <article className="trip-card" key={trip.id}><div className="trip-image" aria-hidden="true"><span>✦</span></div><div className="trip-content"><div className="trip-topline"><span className="status">{trip.status}</span><span>{trip.startDate ? `${formatDate(trip.startDate)} — ${formatDate(trip.endDate)}` : 'Dates not set'}</span></div><h3>{trip.title}</h3><p>{trip.route}</p><button className="card-button" type="button" onClick={() => openItinerary(trip.id)}>Open itinerary →</button></div></article>)}<button className="new-trip-card" type="button" onClick={openCreateTrip}><span className="plus-circle">＋</span><strong>Create another trip</strong><span>Start with a destination and we'll build from there.</span></button></div></section>
        <section className="discover-section" id="discover"><div><span className="eyebrow">DISCOVER</span><h2>Where will you go next?</h2></div><p>Search destinations, find experiences, and turn inspiration into your next itinerary.</p></section>
      </main><footer id="about"><span>✦ GlobeTrotter</span><span>Travel planning, simplified.</span></footer>
      {isCreateOpen && <CreateTripModal destination={destination} cities={cities} startDate={startDate} endDate={endDate} setDestination={setDestination} setCities={setCities} setStartDate={setStartDate} setEndDate={setEndDate} onClose={closeCreateTrip} onSubmit={createTrip} />}
    </div>
  );
}

function CreateTripModal(props: { destination: string; cities: string; startDate: string; endDate: string; setDestination: (v: string) => void; setCities: (v: string) => void; setStartDate: (v: string) => void; setEndDate: (v: string) => void; onClose: () => void; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={props.onClose}><section className="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-trip-title" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" type="button" aria-label="Close" onClick={props.onClose}>×</button><span className="eyebrow">NEW ADVENTURE</span><h2 id="create-trip-title">Create your trip</h2><p className="modal-intro">Set the route and dates. GlobeTrotter will create a day-by-day plan for you.</p><form onSubmit={props.onSubmit}><label>Trip name<input value={props.destination} onChange={(e) => props.setDestination(e.target.value)} placeholder="e.g. Italy Summer Trip" required /></label><label>Cities <span className="field-hint">comma separated</span><input value={props.cities} onChange={(e) => props.setCities(e.target.value)} placeholder="Rome, Florence, Venice" required /></label><div className="date-grid"><label>Start date<input type="date" value={props.startDate} onChange={(e) => props.setStartDate(e.target.value)} required /></label><label>End date<input type="date" value={props.endDate} onChange={(e) => props.setEndDate(e.target.value)} required /></label></div><button className="primary-button modal-submit" type="submit">Create trip →</button></form></section></div>;
}

function TripWorkspace({ trip, onBack, onAddActivity, activityForm, onActivitySubmit, onCloseActivity }: { trip: Trip; onBack: () => void; onAddActivity: (city: string, date: string) => void; activityForm: { city: string; date: string } | null; onActivitySubmit: (e: React.FormEvent<HTMLFormElement>) => void; onCloseActivity: () => void; }) {
  const days = useMemo(() => buildDayPlans(trip), [trip]);
  const totalActivities = Object.values(trip.activities).reduce((sum, items) => sum + items.length, 0);
  return <div className="workspace-shell"><header className="workspace-header"><button className="back-button" type="button" onClick={onBack}>← My Trips</button><span className="workspace-brand">✦ GlobeTrotter</span><span className="workspace-status">{trip.status}</span></header><main className="workspace-main"><section className="workspace-hero"><div><span className="eyebrow">TRIP WORKSPACE</span><h1>{trip.title}</h1><p>{trip.route} <span>·</span> {trip.startDate ? `${formatDate(trip.startDate)} — ${formatDate(trip.endDate)}` : 'Dates not set'}</p></div><div className="workspace-actions"><span className="activity-total">{totalActivities} {totalActivities === 1 ? 'activity' : 'activities'}</span><button className="primary-button" type="button" onClick={() => days[0] && onAddActivity(days[0].city, days[0].date)}>＋ Add activity</button></div></section><div className="workspace-grid"><aside className="route-panel"><span className="panel-label">YOUR ROUTE</span>{trip.cities.map((city, index) => <div className={`city-stop ${index === 0 ? 'active' : ''}`} key={city}><span className="stop-number">{index + 1}</span><div><strong>{city}</strong><small>{index === 0 ? 'Start of journey' : index === trip.cities.length - 1 ? 'Final stop' : 'Next stop'}</small></div></div>)}<div className="route-summary"><strong>{days.length}</strong><span>days planned</span></div></aside><section className="itinerary-panel"><div className="panel-heading"><div><span className="panel-label">DAY BY DAY</span><h2>Your itinerary</h2></div><span className="day-count">{days.length} days · {trip.cities.length} stops</span></div>{days.map((day) => { const activities = trip.activities[day.city] ?? []; return <article className="day-card" key={day.key}><div className="day-marker"><span>DAY</span><strong>{day.dayNumber}</strong></div><div className="day-body"><div className="day-title"><div><span className="date-label">{day.date ? formatShortDate(day.date) : 'Date not set'}</span><span className="city-label">{day.city}</span><h3>{day.dayNumber === 1 ? `Arrival in ${day.city}` : `Explore ${day.city}`}</h3></div><button type="button" onClick={() => onAddActivity(day.city, day.date)}>＋ Add activity</button></div>{activities.length === 0 ? <div className="empty-activity">No activities yet. Add something to make this day yours.</div> : <div className="activity-list">{activities.map((activity) => <div className="activity-item" key={activity.id}><span className="activity-dot">○</span><div><strong>{activity.title}</strong><small>{activity.time}{activity.location ? ` · ${activity.location}` : ''}{activity.duration ? ` · ${activity.duration}` : ''}</small>{activity.notes && <p>{activity.notes}</p>}</div></div>)}</div>}</div></article>;})}</section></div></main>{activityForm && <ActivityModal city={activityForm.city} date={activityForm.date} onClose={onCloseActivity} onSubmit={onActivitySubmit} />}</div>;
}

function ActivityModal({ city, date, onClose, onSubmit }: { city: string; date: string; onClose: () => void; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="create-modal activity-modal" role="dialog" aria-modal="true" aria-labelledby="activity-title" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" type="button" aria-label="Close" onClick={onClose}>×</button><span className="eyebrow">ADD TO ITINERARY</span><h2 id="activity-title">Plan an activity</h2><p className="modal-intro">{city}{date ? ` · ${formatShortDate(date)}` : ''}</p><form onSubmit={onSubmit}><label>Activity name<input name="title" placeholder="e.g. Colosseum tour" required autoFocus /></label><div className="date-grid"><label>Time<input name="time" type="time" /></label><label>Duration<select name="duration" defaultValue="1 hour"><option>30 minutes</option><option>1 hour</option><option>2 hours</option><option>3 hours</option><option>Half day</option><option>Full day</option></select></label></div><label>Location<input name="location" placeholder="e.g. Colosseum, Rome" /></label><label>Notes<textarea name="notes" rows={3} placeholder="Anything to remember..." /></label><button className="primary-button modal-submit" type="submit">Add activity →</button></form></section></div>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
