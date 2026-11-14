export type CollectionItem = { title: string; year: string; origin: string; note: string };

export type Collection = {
  id: string;
  title: string;
  kicker: string;
  blurb: string;
  window: string;
  items: CollectionItem[];
  channels?: { name: string; url: string; why: string }[];
};

/* Takeok's own desk lists. Unlike the wires, these are curated opinions and are
   edited by hand in this file. Availability moves around, so each note stays
   about why the title earns the slot rather than where it streams today. */
export const COLLECTIONS: Collection[] = [
  {
    id: "courtroom-south",
    title: "Courtrooms that hit harder than the fight scene",
    kicker: "Justice thrillers",
    blurb: "Six South Indian films where the case, not the punch, is the set piece.",
    window: "Best over a weekend",
    items: [
      { title: "Jai Bhim", year: "2021", origin: "Tamil", note: "A lawyer fights a system that never files its own paperwork." },
      { title: "Asuran", year: "2019", origin: "Tamil", note: "Vetrimaaran turns caste violence into a chase across three states." },
      { title: "Prasthanam", year: "2010", origin: "Telugu", note: "Devon Kalyan's political crime saga; the dialogue does the heavy lifting." },
      { title: "Thani Oruvan", year: "2015", origin: "Tamil", note: "The villain gets the best arguments, and the film knows it." },
      { title: "Vikram Vedha", year: "2017", origin: "Tamil", note: "Riddles in the docket, and a moral mirror held to the cop." },
      { title: "Guru", year: "2017", origin: "Telugu", note: "Education racket, investigative spine, and a lead who keeps changing his name." },
    ],
  },
  {
    id: "one-perfect-con",
    title: "One perfect con",
    kicker: "Heists & hustles",
    blurb: "The long con, done properly: paperwork, charm, and one greedy mistake.",
    window: "Popcorn viewing",
    items: [
      { title: "Special 26", year: "2013", origin: "Hindi", note: "Raj Chaki's raid-on-a-raiders is the cleanest Indian heist comedy there is." },
      { title: "The Sting", year: "1973", origin: "US", note: "The template. Still the funniest structural trick in the genre." },
      { title: "Inside Man", year: "2006", origin: "US", note: "A bank job that is really a magic show with a witness list." },
      { title: "Brochevarevarura", year: "2019", origin: "Telugu", note: "Three interlocking screwball crimes and a poet's couplet as the loaded gun." },
      { title: "Now You See Me", year: "2013", origin: "US", note: "Style over logic, but the staging sells the sleight of hand." },
      { title: "Agent Sai Srinivasa Athreya", year: "2019", origin: "Telugu", note: "A small-time detective out-cons a much bigger machine." },
    ],
  },
  {
    id: "survival-small-screen",
    title: "Survival, small screen",
    kicker: "Series binge",
    blurb: "Confined spaces, counted rations, and a scoreboard nobody signed up for.",
    window: "Two nights each",
    items: [
      { title: "Squid Game", year: "2021", origin: "Korean", note: "The games are simple; the ledger of debt is the real monster." },
      { title: "Alice in Borderland", year: "2020", origin: "Japanese", note: "Rules-first survival with the best puzzle logic of the bunch." },
      { title: "Sweet Home", year: "2020", origin: "Korean", note: "A building becomes the last human habitat; monsters wear your urges." },
      { title: "All of Us Are Dead", year: "2022", origin: "Korean", note: "School siege zombies with an unusually mean ending." },
      { title: "The 8 Show", year: "2024", origin: "Korean", note: "Eight floors, escalating pay, and a class argument in game-show paint." },
    ],
  },
  {
    id: "animated-not-for-kids",
    title: "Animated, not for kids",
    kicker: "Adult animation",
    blurb: "Frames that could only exist as drawings, aimed squarely at grown-ups.",
    window: "Late evening",
    items: [
      { title: "Perfect Blue", year: "1997", origin: "Japanese", note: "Kon's idol-to-thriller dissolve still beats most live-action paranoia." },
      { title: "Spider-Man: Across the Spider-Verse", year: "2023", origin: "US", note: "Every universe gets its own print technique, and it carries a real argument." },
      { title: "Demon Slayer: Mugen Train", year: "2020", origin: "Japanese", note: "Suflex's train fight is the clearest case for big-screen animation." },
      { title: "Wolf Children", year: "2012", origin: "Japanese", note: "Hosoda turns single parenthood into a fifteen-year landscape." },
      { title: "Paprika", year: "2006", origin: "Japanese", note: "Kon's dream-therapy carousel that Inception borrowed a spine from." },
    ],
  },
  {
    id: "telugu-scale-shift",
    title: "The Telugu scale shift",
    kicker: "How Tollywood grew its frame",
    blurb: "Six titles that moved Telugu cinema's idea of what a big film could be.",
    window: "Rewatch material",
    items: [
      { title: "Baahubali 2: The Conclusion", year: "2017", origin: "Telugu", note: "Made a mythic fight the default benchmark for the industry's own ambition." },
      { title: "RRR", year: "2022", origin: "Telugu", note: "Export-grade action grammar, built on pure mass-heroics logic." },
      { title: "Kalki 2898 AD", year: "2024", origin: "Telugu", note: "Sci-fi worldbuilding with a mythology spine, aimed at a global poster." },
      { title: "Pushpa: The Rule", year: "2024", origin: "Telugu", note: "The red-sandalwood gangster as a folk hero, and the sequel that widened it." },
      { title: "Jersey", year: "2019", origin: "Telugu", note: "Proved a small, disciplined sports drama could out-last the tentpoles." },
      { title: "Eega", year: "2012", origin: "Telugu", note: "S.S. Rajamouli's revenge-told-as-a-housefly film, still the industry's riskiest swing." },
    ],
  },
  {
    id: "shorts-one-sitting",
    title: "Shorts you finish in one sitting",
    kicker: "Follow the channels",
    blurb: "The live short-film wire is thinner than the feature feed, so the desk points at the rooms making it.",
    window: "Ten minutes a pop",
    items: [
      { title: "Documentary shorts", year: "", origin: "Global", note: "Short of the Week keeps the festival circuit in one upload stream." },
      { title: "Indian sketch comedy", year: "", origin: "Hindi", note: "FilterCopy and BB Ki Vines are where most Indian short writers start." },
      { title: "Telugu indie", year: "", origin: "Telugu", note: "TeamWorks Pictures runs the local short-film shelf." },
    ],
    channels: [
      { name: "Short of the Week", url: "https://www.youtube.com/channel/UCyp-EzJrdTOd9uNPvmdst-w", why: "Curated festival shorts" },
      { name: "Olypix", url: "https://www.youtube.com/channel/UCFWKslbgsFnnSBL_tpL4xTw", why: "Music-video-leaning indie shorts" },
      { name: "FilterCopy", url: "https://www.youtube.com/channel/UC7IMq6lLHbptAnSucW1pClA", why: "Bengali/Hindi sketch studio" },
      { name: "BB Ki Vines", url: "https://www.youtube.com/channel/UCqwUrj10mAEsqezcItqvwEw", why: "Character comedy, Indian YouTube" },
      { name: "TeamWorks Pictures", url: "https://www.youtube.com/channel/UCBAfukPRzJs0ZrPUfH0mDpw", why: "Telugu shorts and indie features" },
    ],
  },
];
