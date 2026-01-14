import { mockAvailabilityByAdId } from "./mockAvailability";

// in-memory store
const store = {
  ...mockAvailabilityByAdId,
};

export function getSlotsForAd(adId) {
  return store[adId] || [];
}

export function setSlotsForAd(adId, slots) {
  store[adId] = slots;
}

export function bookSlot(adId, availabilityId) {
  const slots = store[adId] || [];
  store[adId] = slots.map((s) =>
    s.availability_id === availabilityId ? { ...s, is_booked: true } : s
  );
  return store[adId];
}
