const en = {
  // Sidebar
  sidebar: {
    brand: 'FlightTracker',
    subtitle: 'Command Center',
    dashboard: 'Dashboard',
    flights: 'Flights',
    watchlist: 'Watchlist',
    settings: 'Settings',
    collapse: 'Collapse',
    expandSidebar: 'Expand sidebar',
    collapseSidebar: 'Collapse sidebar',
    goToDashboard: 'Go to Dashboard',
    viewFlights: 'View Flights',
    viewWatchlist: 'View Watchlist',
    openSettings: 'Open Settings',
  },

  // TopBar
  topbar: {
    title: 'Live Flight Tracker',
    searchPlaceholder: 'Flight ID ',
    track: 'Track',
    searching: 'Searching',
  },

  // Footer
  footer: {
    copyright: 'FlightTracker',
    poweredBy: 'Powered by Aviation Stack API',
  },

  // Dashboard
  dashboard: {
    heroTitle: 'Flight Tracker Command Center',
    heroSubtitle: 'Enter a flight number above to get real-time status updates, departure and arrival information, and more.',
    recentSearches: 'Recent Searches',
    clearHistory: 'Clear history',
    errorTitle: 'Error fetching flight data',
    noFlightsTitle: 'No flights found',
    noFlightsText: 'No flights found matching "{query}". Try AA123 or ACA228.',
    loading: 'Loading…',
  },

  // Flights page
  flightsPage: {
    title: 'Flights',
    subtitle: 'Search and track any flight in real time. Enter a flight number in the search bar above.',
    searchTitle: 'Search for a flight',
    searchSubtitle: 'Use the search bar above to look up any flight by its IATA or ICAO code.',
    noFlightsTitle: 'No flights found',
    noFlightsText: 'No flights found matching "{query}". Try AA123 or ACA228.',
    errorTitle: 'Error fetching flight data',
  },

  // Flight Detail
  flightDetail: {
    backToResults: 'Back to Results',
    addToWatchlist: 'Add to Watchlist',
    inWatchlist: 'In Watchlist',
    addToCalendar: 'Add to Calendar',
    departure: 'Departure',
    arrival: 'Arrival',
    airport: 'Airport',
    airportCode: 'Airport Code',
    timezone: 'Timezone',
    date: 'Date',
    scheduled: 'Scheduled',
    estimated: 'Estimated',
    terminal: 'Terminal',
    gate: 'Gate',
    early: 'Early',
    delay: 'Delay',
    minEarly: '{min} min early',
    minDelay: '+{min} min',
    minDelayLabel: '+{min} min delay',
    loadingDetails: 'Loading flight details…',
    flightCancelled: 'This flight has been cancelled by the airline. Please contact your carrier for alternatives.',
    flightDiverted: 'This flight has been diverted from its original destination.',
    flightIncident: 'An incident has been reported for this flight. Please check with the airline for details.',
    flightStatusPrefix: 'Flight',
  },

  // Watchlist
  watchlistPage: {
    title: 'Watchlist',
    subtitle: 'Your personal flight board. Keep track of pinned flights and monitor their schedule in real time.',
    clearAll: 'Clear All',
    clearConfirm: 'Are you sure you want to clear your entire watchlist?',
    emptyTitle: 'No Pinned Flights',
    emptySubtitle: 'Track flights and bookmark them from their details page to create your personal live dashboard.',
    searchFlights: 'Search Flights',
    departureDate: 'Departure Date',
    scheduledTime: 'Scheduled Time',
    statusInfo: 'Status Info',
    removeFromWatchlist: 'Remove from watchlist',
    earlyLabel: '{min}m early',
    delayLabel: '+{min}m delay',
  },

  // Stats Cards
  stats: {
    totalFlights: 'Total Flights',
    activeInAir: 'Active / In Air',
    landed: 'Landed',
    delayed: 'Delayed',
    cancelledDiverted: 'Cancelled / Diverted',
  },

  // Flight Table
  flightTable: {
    title: 'Flight List',
    resultsFound: '{count} result{plural} found',
    live: 'Live',
    flight: 'Flight',
    origin: 'Origin',
    destination: 'Destination',
    departure: 'Departure',
    arrival: 'Arrival',
    telemetry: 'Telemetry',
    status: 'Status',
    calendar: 'Calendar',
    addToCalendar: 'Add to Google Calendar',
    from: 'From',
    to: 'To',
    earlyLabel: '{min}m early',
    lateLabel: '+{min}m late',
  },

  // Settings
  settings: {
    title: 'Settings',
    subtitle: 'Manage your preferences and display settings.',
    saved: 'Setting saved',

    // General tab
    general: 'General',
    generalTitle: 'General Preferences',
    generalSubtitle: 'Configure units and timezone logic for all flight data.',
    distanceUnit: 'Distance Unit',
    distanceDesc: 'Used for flight paths and range',
    kilometers: 'Kilometers',
    miles: 'Miles',
    altitudeUnit: 'Altitude Unit',
    altitudeDesc: 'Used for live flight altitude tracking',
    meters: 'Meters',
    feet: 'Feet',

    // Appearance tab
    appearance: 'Appearance',
    themeTitle: 'Theme Accents',
    themeSubtitle: 'Personalize the look and feel of your command center.',
    skyBlue: 'Sky Blue',
    atcEmerald: 'ATC Emerald',
    radarAmber: 'Radar Amber',

    // Language tab
    language: 'Language',
    languageTitle: 'Display Language',
    languageSubtitle: 'Choose the language for all interface elements.',
  },
} as const;

// Widen literal string types to string so translations can have different values
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

export type TranslationKeys = DeepStringify<typeof en>;
export default en as TranslationKeys;

