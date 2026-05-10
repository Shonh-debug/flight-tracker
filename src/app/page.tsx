import FlightSearch from '@/components/FlightSearch';

export default function Home() {
  return (
    <main className="main-container">
      <h1 className="hero-title">Flight Tracker</h1>
      <p className="hero-subtitle">Real-time status updates and elegant flight tracking.</p>
      
      <FlightSearch />
    </main>
  );
}
