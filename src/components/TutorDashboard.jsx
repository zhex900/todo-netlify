import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import {
  Music,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Save,
  X,
} from "lucide-react";
import { CreateAdvertisement } from "./CreateAdvertisement";

async function fetchJson(url, options = {}) {
  const res = await fetch(url, { credentials: "include", ...options });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.error || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// ---------- Availability dropdown helpers ----------
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DAY_INDEX = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

// 6:00 -> 22:00 every 30 mins
const TIME_OPTIONS = (() => {
  const out = [];
  for (let h = 6; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) continue;
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
})();

const DURATION_OPTIONS = [30, 60, 90, 120, 150, 180];

function dayNameFromDate(date) {
  // JS: Sunday=0 ... Saturday=6
  const js = date.getDay();
  const idx = (js + 6) % 7; // convert so Monday=0
  return DAYS[idx];
}

function timeFromDate(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

function minutesBetween(aIso, bIso) {
  return Math.round((new Date(bIso) - new Date(aIso)) / 60000);
}

function applyTimeToDate(date, hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

// Move date to the target weekday, staying close to the base date
function shiftDateToWeekday(baseDate, targetDayName) {
  const base = new Date(baseDate);
  const current = DAY_INDEX[dayNameFromDate(base)];
  const target = DAY_INDEX[targetDayNameNameSafe(targetDayName)];

  // Move forward/back within the week to the target
  let diff = target - current;
  // choose the shorter direction
  if (diff > 3) diff -= 7;
  if (diff < -3) diff += 7;

  const d = new Date(base);
  d.setDate(d.getDate() + diff);
  return d;
}

function targetDayNameNameSafe(day) {
  return DAYS.includes(day) ? day : "Monday";
}

// For adding: next occurrence from "now" for chosen weekday
function nextOccurrence(dayName) {
  const now = new Date();
  const nowIdx = DAY_INDEX[dayNameFromDate(now)];
  const targetIdx = DAY_INDEX[targetDayNameNameSafe(dayName)];
  let diff = targetIdx - nowIdx;
  if (diff < 0) diff += 7;
  // if same day, still allow "today"
  const d = new Date(now);
  d.setDate(d.getDate() + diff);
  d.setSeconds(0, 0);
  return d;
}

// Display simplified slot label
function slotLabel(slot) {
  const s = new Date(slot.start_time);
  const day = dayNameFromDate(s);
  const time = timeFromDate(s);
  const dur = minutesBetween(slot.start_time, slot.end_time);
  return `${day} ${time} · ${dur} min`;
}

export function TutorDashboard({ onLogout }) {
  const [me, setMe] = useState(null);

  const [ads, setAds] = useState([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  // Availability management
  const [openAvailabilityFor, setOpenAvailabilityFor] = useState(null); // ad_id
  const [availabilityMap, setAvailabilityMap] = useState({}); // { [adId]: slots[] }
  const [loadingAvailFor, setLoadingAvailFor] = useState(null);

  // inline slot edit state
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [slotDraft, setSlotDraft] = useState({
    day: "Monday",
    time: "18:00",
    duration: 60,
  });

  // add slot state
  const [newSlotDraft, setNewSlotDraft] = useState({
    day: "Monday",
    time: "18:00",
    duration: 60,
  });

  // ---------- load session + ads ----------
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const tutor = await fetchJson("/api/auth/me");
        if (cancelled) return;
        setMe(tutor);

        await loadMyAds(tutor.tutor_id, cancelled);
      } catch {
        if (!cancelled) {
          setMe(null);
          setAds([]);
        }
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadMyAds(tutor_id, cancelledFlag = false) {
    setLoadingAds(true);
    try {
      const mine = await fetchJson("/api/ads/mine");
      if (!cancelledFlag) setAds(Array.isArray(mine) ? mine : []);
    } catch (e) {
      console.error("Failed to load tutor ads:", e);
      if (!cancelledFlag) setAds([]);
    } finally {
      if (!cancelledFlag) setLoadingAds(false);
    }
  }

  // ---------- helpers for instrument/location resolution ----------
  async function resolveInstrumentId(instrumentName) {
    const instruments = await fetchJson("/api/instruments");
    const list = Array.isArray(instruments) ? instruments : [];
    if (list.length === 0) return 1;

    const match = list.find(
      (i) =>
        String(i.instrument_name || "")
          .toLowerCase()
          .trim() ===
        String(instrumentName || "")
          .toLowerCase()
          .trim()
    );
    return match?.instrument_id ?? list[0].instrument_id;
  }

  async function resolveLocationId(locationName) {
    const locations = await fetchJson("/api/locations");
    const list = Array.isArray(locations) ? locations : [];
    if (list.length === 0) return 1;

    const match = list.find(
      (l) =>
        String(l.location_name || "")
          .toLowerCase()
          .trim() ===
        String(locationName || "")
          .toLowerCase()
          .trim()
    );
    return match?.location_id ?? list[0].location_id;
  }

  // ---------- CREATE AD ----------
  async function handleCreateAd(formData) {
    setSaving(true);
    try {
      if (!me?.tutor_id) throw new Error("Not logged in");

      const chosenInstrumentName = (formData.instruments || [])[0] || "Piano";
      const chosenLocationName = formData.suburb || "Sydney CBD";

      const instrument_id = await resolveInstrumentId(chosenInstrumentName);
      const location_id = await resolveLocationId(chosenLocationName);

      await fetchJson("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_id,
          instrument_id,
          ad_description: formData.bio || "New tutor ad",
          years_experience: Number(formData.experience || 0),
          hourly_rate: Number(formData.hourlyRate || 0),
          img_url: formData.image || null,
          destroy_at: null,
        }),
      });

      await loadMyAds(me.tutor_id);
      setShowCreateForm(false);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to create ad");
    } finally {
      setSaving(false);
    }
  }

  // ---------- EDIT AD ----------
  async function handleSaveEdit(formData) {
    setSaving(true);
    try {
      if (!editingAd?.ad_id) throw new Error("Missing ad_id");

      const chosenInstrumentName = (formData.instruments || [])[0] || "Piano";
      const chosenLocationName = formData.suburb || "Sydney CBD";

      const instrument_id = await resolveInstrumentId(chosenInstrumentName);
      const location_id = await resolveLocationId(chosenLocationName);

      await fetchJson(`/api/ads/${editingAd.ad_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_id,
          instrument_id,
          ad_description: formData.bio || "",
          years_experience: Number(formData.experience || 0),
          hourly_rate: Number(formData.hourlyRate || 0),
          img_url: formData.image || null,
          destroy_at: null,
        }),
      });

      await loadMyAds(me.tutor_id);
      setEditingAd(null);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to update ad");
    } finally {
      setSaving(false);
    }
  }

  // ---------- DELETE AD ----------
  async function handleDeleteAd(ad) {
    const ok = confirm("Delete this ad? This cannot be undone.");
    if (!ok) return;

    setSaving(true);
    try {
      await fetchJson(`/api/ads/${ad.ad_id}`, { method: "DELETE" });
      await loadMyAds(me.tutor_id);

      if (openAvailabilityFor === ad.ad_id) setOpenAvailabilityFor(null);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to delete ad");
    } finally {
      setSaving(false);
    }
  }

  // ---------- AVAILABILITY: LOAD ----------
  async function loadAvailabilityForAd(adId) {
    setLoadingAvailFor(adId);
    try {
      // Use the same endpoint as ContactModal
      const slots = await fetchJson(`/api/ads/${adId}/availability`);
      setAvailabilityMap((prev) => ({
        ...prev,
        [adId]: Array.isArray(slots) ? slots : [],
      }));
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to load availability");
    } finally {
      setLoadingAvailFor(null);
    }
  }

  async function toggleAvailability(ad) {
    const adId = ad.ad_id;

    if (openAvailabilityFor === adId) {
      setOpenAvailabilityFor(null);
      setEditingSlotId(null);
      return;
    }

    setOpenAvailabilityFor(adId);

    if (!availabilityMap[adId]) {
      await loadAvailabilityForAd(adId);
    }
  }

  // ---------- AVAILABILITY: ADD ----------
  async function handleAddSlot(adId) {
    try {
      setSaving(true);

      // Next occurrence of selected weekday, then set chosen time
      let start = nextOccurrence(newSlotDraft.day);
      start = applyTimeToDate(start, newSlotDraft.time);

      const end = new Date(start.getTime() + newSlotDraft.duration * 60000);

      await fetchJson("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad_id: adId,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          user_capacity: 1,
        }),
      });

      await loadAvailabilityForAd(adId);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to add slot");
    } finally {
      setSaving(false);
    }
  }

  // ---------- AVAILABILITY: EDIT ----------
  function beginEditSlot(slot) {
    const s = new Date(slot.start_time);
    const e = new Date(slot.end_time);

    setEditingSlotId(slot.availability_id);
    setSlotDraft({
      day: dayNameFromDate(s),
      time: timeFromDate(s),
      duration: Math.max(30, minutesBetween(slot.start_time, slot.end_time)),
    });
  }

  function cancelEditSlot() {
    setEditingSlotId(null);
  }

  async function saveEditSlot(adId, slot) {
    try {
      setSaving(true);

      // Keep this slot in the same general week as its original start_time
      const base = new Date(slot.start_time);

      let start = shiftDateToWeekday(base, slotDraft.day);
      start = applyTimeToDate(start, slotDraft.time);

      const end = new Date(start.getTime() + slotDraft.duration * 60000);

      await fetchJson(`/api/availability/${slot.availability_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        }),
      });

      cancelEditSlot();
      await loadAvailabilityForAd(adId);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to update slot");
    } finally {
      setSaving(false);
    }
  }

  // ---------- AVAILABILITY: DELETE ----------
  async function deleteSlot(adId, slot) {
    if (slot.is_booked) {
      alert("Booked slots cannot be deleted.");
      return;
    }

    const ok = confirm("Delete this time slot?");
    if (!ok) return;

    setSaving(true);
    try {
      await fetchJson(`/api/availability/${slot.availability_id}`, {
        method: "DELETE",
      });
      await loadAvailabilityForAd(adId);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to delete slot");
    } finally {
      setSaving(false);
    }
  }

  // ---------- map DB ad -> CreateAdvertisement initial Data ----------
  function adToFormInitial(ad) {
    return {
      name: me?.name ?? "",
      suburb: ad.Location?.location_name ?? "Sydney CBD",
      hourlyRate: ad.hourly_rate ?? "",
      experience: ad.years_experience ?? "",
      bio: ad.ad_description ?? "",
      image: ad.img_url ?? "",
      instruments: [ad.Instrument?.instrument_name].filter(Boolean),
      availability: [],
      rating: 5.0,
      totalReviews: 0,
    };
  }

  const hasAds = ads.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Music className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-primary">Tutor Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {me
                    ? `Logged in as ${me.name} (${me.email})`
                    : "Loading session..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!showCreateForm && !editingAd && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  disabled={saving}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Advertisement
                </Button>
              )}

              <Button variant="outline" onClick={onLogout} disabled={saving}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Create / Edit form */}
        {showCreateForm && (
          <CreateAdvertisement
            mode="create"
            onSubmit={handleCreateAd}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {editingAd && (
          <CreateAdvertisement
            mode="edit"
            initialData={adToFormInitial(editingAd)}
            onSubmit={handleSaveEdit}
            onCancel={() => setEditingAd(null)}
          />
        )}

        {/* Ads list */}
        {!showCreateForm && !editingAd && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Your Ads {loadingAds ? "(loading…)" : `(${ads.length})`}
              </h2>
            </div>

            {!hasAds ? (
              <Card>
                <CardContent className="p-10 text-center">
                  <Music className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
                  <h3 className="mb-2">No ads yet</h3>
                  <p className="text-muted-foreground">
                    Click “Create Advertisement” to publish your first listing.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {ads.map((ad) => {
                  const isOpen = openAvailabilityFor === ad.ad_id;
                  const slots = availabilityMap[ad.ad_id] || [];
                  const isAvailLoading = loadingAvailFor === ad.ad_id;

                  return (
                    <Card key={ad.ad_id}>
                      <CardContent className="p-5">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex gap-4">
                            <img
                              src={
                                ad.img_url ||
                                "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop"
                              }
                              alt="Ad"
                              className="w-24 h-24 rounded-lg object-cover border"
                            />
                            <div>
                              <div className="font-semibold text-base">
                                {ad.Instrument?.instrument_name || "Instrument"}{" "}
                                lessons
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {ad.Location?.location_name ||
                                  "Unknown location"}{" "}
                                • ${ad.hourly_rate}/hr • {ad.years_experience}{" "}
                                yrs
                              </div>
                              <p className="mt-2 text-sm">
                                {ad.ad_description || "No description"}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 md:justify-end">
                            <Button
                              variant="outline"
                              onClick={() => setEditingAd(ad)}
                              disabled={saving}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit Ad
                            </Button>

                            <Button
                              variant="outline"
                              onClick={() => toggleAvailability(ad)}
                              disabled={saving}
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Manage Times
                            </Button>

                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteAd(ad)}
                              disabled={saving}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>

                        {/* Availability panel */}
                        {isOpen && (
                          <div className="mt-4 border-t pt-4 space-y-3">
                            <div className="font-medium">
                              Availability (day/time/duration)
                            </div>

                            {/* Add slot row */}
                            <div className="flex flex-col md:flex-row gap-2 md:items-end">
                              <div className="flex-1">
                                <label className="text-sm text-muted-foreground">
                                  Day
                                </label>
                                <select
                                  value={newSlotDraft.day}
                                  onChange={(e) =>
                                    setNewSlotDraft((p) => ({
                                      ...p,
                                      day: e.target.value,
                                    }))
                                  }
                                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                                >
                                  {DAYS.map((d) => (
                                    <option key={d} value={d}>
                                      {d}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex-1">
                                <label className="text-sm text-muted-foreground">
                                  Start time
                                </label>
                                <select
                                  value={newSlotDraft.time}
                                  onChange={(e) =>
                                    setNewSlotDraft((p) => ({
                                      ...p,
                                      time: e.target.value,
                                    }))
                                  }
                                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                                >
                                  {TIME_OPTIONS.map((t) => (
                                    <option key={t} value={t}>
                                      {t}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex-1">
                                <label className="text-sm text-muted-foreground">
                                  Duration
                                </label>
                                <select
                                  value={newSlotDraft.duration}
                                  onChange={(e) =>
                                    setNewSlotDraft((p) => ({
                                      ...p,
                                      duration: Number(e.target.value),
                                    }))
                                  }
                                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                                >
                                  {DURATION_OPTIONS.map((d) => (
                                    <option key={d} value={d}>
                                      {d} min
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <Button
                                onClick={() => handleAddSlot(ad.ad_id)}
                                disabled={saving}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Slot
                              </Button>
                            </div>

                            {isAvailLoading ? (
                              <div className="text-sm text-muted-foreground">
                                Loading times…
                              </div>
                            ) : slots.length === 0 ? (
                              <div className="text-sm text-muted-foreground">
                                No availability found for this ad.
                              </div>
                            ) : (
                              <ul className="space-y-2 text-sm">
                                {slots.map((s) => {
                                  const isEditing =
                                    editingSlotId === s.availability_id;

                                  return (
                                    <li
                                      key={s.availability_id}
                                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-md border p-3"
                                    >
                                      <div className="flex-1">
                                        {!isEditing ? (
                                          <div className="flex items-center justify-between gap-3">
                                            <div>{slotLabel(s)}</div>
                                            <div className="text-muted-foreground">
                                              {s.is_booked ? "Booked" : "Open"}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <div>
                                              <label className="text-xs text-muted-foreground">
                                                Day
                                              </label>
                                              <select
                                                value={slotDraft.day}
                                                onChange={(e) =>
                                                  setSlotDraft((p) => ({
                                                    ...p,
                                                    day: e.target.value,
                                                  }))
                                                }
                                                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                                              >
                                                {DAYS.map((d) => (
                                                  <option key={d} value={d}>
                                                    {d}
                                                  </option>
                                                ))}
                                              </select>
                                            </div>

                                            <div>
                                              <label className="text-xs text-muted-foreground">
                                                Start time
                                              </label>
                                              <select
                                                value={slotDraft.time}
                                                onChange={(e) =>
                                                  setSlotDraft((p) => ({
                                                    ...p,
                                                    time: e.target.value,
                                                  }))
                                                }
                                                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                                              >
                                                {TIME_OPTIONS.map((t) => (
                                                  <option key={t} value={t}>
                                                    {t}
                                                  </option>
                                                ))}
                                              </select>
                                            </div>

                                            <div>
                                              <label className="text-xs text-muted-foreground">
                                                Duration
                                              </label>
                                              <select
                                                value={slotDraft.duration}
                                                onChange={(e) =>
                                                  setSlotDraft((p) => ({
                                                    ...p,
                                                    duration: Number(
                                                      e.target.value
                                                    ),
                                                  }))
                                                }
                                                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                                              >
                                                {DURATION_OPTIONS.map((d) => (
                                                  <option key={d} value={d}>
                                                    {d} min
                                                  </option>
                                                ))}
                                              </select>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex gap-2 justify-end">
                                        {!isEditing ? (
                                          <>
                                            <Button
                                              variant="outline"
                                              onClick={() => beginEditSlot(s)}
                                              disabled={saving || s.is_booked}
                                              title={
                                                s.is_booked
                                                  ? "Booked slots cannot be edited"
                                                  : "Edit slot"
                                              }
                                            >
                                              <Pencil className="w-4 h-4 mr-2" />
                                              Edit
                                            </Button>

                                            <Button
                                              variant="destructive"
                                              onClick={() =>
                                                deleteSlot(ad.ad_id, s)
                                              }
                                              disabled={saving || s.is_booked}
                                              title={
                                                s.is_booked
                                                  ? "Booked slots cannot be deleted"
                                                  : "Delete slot"
                                              }
                                            >
                                              <Trash2 className="w-4 h-4 mr-2" />
                                              Delete
                                            </Button>
                                          </>
                                        ) : (
                                          <>
                                            <Button
                                              onClick={() =>
                                                saveEditSlot(ad.ad_id, s)
                                              }
                                              disabled={saving}
                                            >
                                              <Save className="w-4 h-4 mr-2" />
                                              Save
                                            </Button>

                                            <Button
                                              variant="outline"
                                              onClick={cancelEditSlot}
                                              disabled={saving}
                                            >
                                              <X className="w-4 h-4 mr-2" />
                                              Cancel
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
