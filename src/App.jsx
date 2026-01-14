import { useState, useMemo, useEffect } from "react";
import { FilterPanel } from "./components/FilterPanel";
import { TutorCard } from "./components/TutorCard";
import { ContactModal } from "./components/ContactModal";
import { LoginModal } from "./components/LoginModal";
import { TutorDashboard } from "./components/TutorDashboard";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Music, Search, LogIn, UserPlus } from "lucide-react";
import { pickStableAvatar } from "./utils/avatar";
import { RegisterModal } from "./components/RegisterModal";

// Small helper: fetch JSON and throw useful errors-------------------------------------
async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include", // ALWAYS send cookies
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.error || `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

/**
 * Creates bookable slots from the CreateAdvertisement "availability days".
 *  save these into the DB as Availability rows.
 */
function makeSlotsFromDays(days, countPerDay = 1) {
  const DAY_INDEX = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  function nextDateForDay(dayName) {
    const today = new Date();
    const target = DAY_INDEX[dayName];
    const diff = (target - today.getDay() + 7) % 7;
    const d = new Date(today);
    d.setDate(today.getDate() + (diff === 0 ? 7 : diff));
    return d;
  }

  const slots = [];
  (days || []).forEach((day) => {
    const base = nextDateForDay(day);

    for (let i = 0; i < countPerDay; i++) {
      const start = new Date(base);
      start.setHours(18 + i, 0, 0, 0);

      const end = new Date(start);
      end.setHours(start.getHours() + 1);

      slots.push({
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });
    }
  });

  slots.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  return slots;
}

export default function App() {
  const [tutors, setTutors] = useState([]); // DB ads mapped into TutorCard shape
  const [loadingAds, setLoadingAds] = useState(false);

  const [selectedInstruments, setSelectedInstruments] = useState([]);
  const [selectedSuburbs, setSelectedSuburbs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTutor, setCurrentTutor] = useState(null);

  // Load DB ads on startup ---------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadAds() {
      setLoadingAds(true);
      try {
        const ads = await fetchJson("/api/ads");

        const mapped = (Array.isArray(ads) ? ads : []).map((ad) => ({
          id: `ad-${ad.ad_id}`,
          adId: ad.ad_id,

          name: ad.Tutor?.name ?? `Tutor #${ad.tutor_id}`,
          suburb: ad.Location?.location_name ?? "Unknown location",
          image:
            ad.img_url ||
            ad.Tutor?.avatar_url ||
            "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=600&h=400&fit=crop",
          bio: ad.ad_description || "",
          instruments: [ad.Instrument?.instrument_name || "Piano"],

          experience: ad.years_experience ?? 0,
          hourlyRate: Number(ad.hourly_rate ?? 0),

          rating: 5.0,
          totalReviews: 0,

          tutor_id: ad.tutor_id,
        }));

        if (!cancelled) setTutors(mapped);
      } catch (e) {
        console.error("Failed to load ads", e);
        if (!cancelled) setTutors([]);
      } finally {
        if (!cancelled) setLoadingAds(false);
      }
    }

    loadAds();
    return () => {
      cancelled = true;
    };
  }, []);

  // Restore session from cookie (refresh-safe login) --------------------------------
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const me = await fetchJson("/api/auth/me");
        if (!cancelled) {
          setIsLoggedIn(true);
          setCurrentTutor(me);
        }
      } catch {}
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // Login handler (called by LoginModal)
  const handleLogin = (tutor) => {
    setIsLoggedIn(true);
    setCurrentTutor(tutor);
    setShowLoginModal(false);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetchJson("/api/auth/logout", { method: "POST" });
    } catch {}
    setIsLoggedIn(false);
    setCurrentTutor(null);
  };

  /**
   * CreateAdvertisement -> Create an Ad in DB + create Availability rows in DB,
   * then update UI immediately
   */
  const handleCreateAdvertisement = async (newTutor) => {
    try {
      if (!newTutor) throw new Error("Missing form data");

      const me = await fetchJson("/api/auth/me");
      if (!me?.tutor_id) throw new Error("Not logged in as a tutor");

      setCurrentTutor(me);
      setIsLoggedIn(true);

      const tutor_id = me.tutor_id;

      const chosenInstrumentName = (newTutor.instruments || [])[0] || "Piano";
      const chosenLocationName = newTutor.suburb || "Sydney CBD";

      const stableAvatar =
        newTutor.image && newTutor.image.trim()
          ? newTutor.image.trim()
          : pickStableAvatar(
              newTutor.name || newTutor.email || String(tutor_id)
            );

      // Resolve instrument_id
      let instrument_id = 1;
      const instruments = await fetchJson("/api/instruments");
      if (Array.isArray(instruments) && instruments.length > 0) {
        const match = instruments.find(
          (i) =>
            String(i.instrument_name || "")
              .toLowerCase()
              .trim() === chosenInstrumentName.toLowerCase().trim()
        );
        instrument_id = match?.instrument_id ?? instruments[0].instrument_id;
      }

      // Resolve location_id
      let location_id = 1;
      const locations = await fetchJson("/api/locations");
      if (Array.isArray(locations) && locations.length > 0) {
        const match = locations.find(
          (l) =>
            String(l.location_name || "")
              .toLowerCase()
              .trim() === chosenLocationName.toLowerCase().trim()
        );
        location_id = match?.location_id ?? locations[0].location_id;
      }

      // Create the Ad
      const createdAd = await fetchJson("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutor_id,
          location_id,
          instrument_id,
          ad_description: newTutor.bio || "New tutor ad",
          years_experience: Number(newTutor.experience || 0),
          hourly_rate: Number(newTutor.hourlyRate || 0),
          img_url: stableAvatar,
          destroy_at: null,
        }),
      });

      // Optional availability
      const slots = makeSlotsFromDays(newTutor.availability || [], 1);
      if (slots.length > 0) {
        await Promise.all(
          slots.map((s) =>
            fetchJson("/api/availability", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id: 1,
                ad_id: createdAd.ad_id,
                start_time: s.start_time,
                end_time: s.end_time,
                is_booked: false,
                user_capacity: 1,
              }),
            })
          )
        );
      }

      // Update UI
      setTutors((prev) => [
        {
          id: `ad-${createdAd.ad_id}`,
          adId: createdAd.ad_id,
          name: me.name || newTutor.name || `Tutor #${tutor_id}`,
          suburb: chosenLocationName,
          image: createdAd.img_url || stableAvatar,
          bio: createdAd.ad_description || "",
          instruments: newTutor.instruments?.length
            ? newTutor.instruments
            : [chosenInstrumentName],
          experience: createdAd.years_experience ?? 0,
          hourlyRate: Number(createdAd.hourly_rate ?? 0),
          rating: 5.0,
          totalReviews: 0,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("Create advertisement failed:", err);
      alert(err?.message || "Failed to create advertisement");
    }
  };

  // Filter options
  const availableInstruments = useMemo(() => {
    const instruments = new Set();
    tutors.forEach((t) => {
      (t.instruments || []).forEach((inst) => instruments.add(inst));
    });
    return Array.from(instruments).sort();
  }, [tutors]);

  const availableSuburbs = useMemo(() => {
    const suburbs = new Set();
    tutors.forEach((t) => {
      if (t.suburb) suburbs.add(t.suburb);
    });
    return Array.from(suburbs).sort();
  }, [tutors]);

  // Apply filters
  const filteredTutors = useMemo(() => {
    return tutors.filter((tutor) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = String(tutor.name || "")
          .toLowerCase()
          .includes(query);
        const matchesBio = String(tutor.bio || "")
          .toLowerCase()
          .includes(query);
        const matchesInstrument = (tutor.instruments || []).some((inst) =>
          String(inst).toLowerCase().includes(query)
        );
        if (!matchesName && !matchesBio && !matchesInstrument) return false;
      }

      if (selectedInstruments.length > 0) {
        const hasMatching = (tutor.instruments || []).some((inst) =>
          selectedInstruments.includes(inst)
        );
        if (!hasMatching) return false;
      }

      if (selectedSuburbs.length > 0) {
        if (!selectedSuburbs.includes(tutor.suburb)) return false;
      }

      return true;
    });
  }, [tutors, searchQuery, selectedInstruments, selectedSuburbs]);

  // Sort
  const sortedTutors = useMemo(() => {
    const tutorsCopy = [...filteredTutors];
    switch (sortBy) {
      case "rating":
        return tutorsCopy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case "price-low":
        return tutorsCopy.sort(
          (a, b) => (a.hourlyRate ?? 0) - (b.hourlyRate ?? 0)
        );
      case "price-high":
        return tutorsCopy.sort(
          (a, b) => (b.hourlyRate ?? 0) - (a.hourlyRate ?? 0)
        );
      case "experience":
        return tutorsCopy.sort(
          (a, b) => (b.experience ?? 0) - (a.experience ?? 0)
        );
      default:
        return tutorsCopy;
    }
  }, [filteredTutors, sortBy]);

  // Dashboard (logged in)
  if (isLoggedIn) {
    return (
      <TutorDashboard
        onLogout={handleLogout}
        onCreateAdvertisement={handleCreateAdvertisement}
        currentTutor={currentTutor} // might be useful for “Welcome, Sarah”
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Music className="w-8 h-8 text-primary" />
                <h1 className="text-primary">Music Tutor Marketplace</h1>
              </div>
              <p className="text-muted-foreground mt-2">
                Find the perfect music tutor for your instrument and schedule
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRegisterModal(true)}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Create Tutor Account
              </Button>

              <Button onClick={() => setShowLoginModal(true)}>
                <LogIn className="w-5 h-5 mr-2" />
                Tutor Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <FilterPanel
                selectedInstruments={selectedInstruments}
                selectedSuburbs={selectedSuburbs}
                onInstrumentChange={setSelectedInstruments}
                onSuburbChange={setSelectedSuburbs}
                availableInstruments={availableInstruments}
                availableSuburbs={availableSuburbs}
              />
            </div>
          </aside>

          {/* Tutors Grid */}
          <div className="lg:col-span-3">
            {/* Search and Sort Bar */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, instrument, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="sm:w-48">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="experience">Most Experienced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Count + Loading */}
            <div className="mb-6 flex items-center justify-between">
              <h2>
                {sortedTutors.length}{" "}
                {sortedTutors.length === 1 ? "tutor" : "tutors"} found
              </h2>
              {loadingAds ? (
                <span className="text-sm text-muted-foreground">
                  Loading ads…
                </span>
              ) : null}
            </div>

            {sortedTutors.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="mb-2">No tutors found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters to see more results
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedTutors.map((tutor) => (
                  //where tutor cards are rendered after the data is fetched-------------
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                    onContact={setSelectedTutor}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Contact Modal */}
      {selectedTutor && (
        <ContactModal
          tutor={selectedTutor}
          onClose={() => setSelectedTutor(null)}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onRegistered={(tutor) => handleLogin(tutor)} // auto-login after register
        />
      )}
    </div>
  );
}
