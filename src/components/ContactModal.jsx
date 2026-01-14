import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { sendTableEmail } from "./SendMail";

// Same weekday ordering as users see
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

function dayNameFromDate(date) {
  const js = date.getDay();
  const idx = (js + 6) % 7; // Monday=0
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

export function ContactModal({ tutor, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    instrument: "",
    message: "",
  });

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchAvailability() {
      if (!tutor?.adId) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/ads/${tutor.adId}/availability`);
        const data = await res.json();
        if (!cancelled) setSlots(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to fetch availability", e);
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAvailability();
    return () => {
      cancelled = true;
    };
  }, [tutor?.adId]);

  const grouped = useMemo(() => {
    const out = {};
    for (const s of slots) {
      const start = new Date(s.start_time);
      const day = dayNameFromDate(start);

      if (!out[day]) out[day] = [];
      out[day].push({
        ...s,
        _day: day,
        _time: timeFromDate(start),
        _dur: minutesBetween(s.start_time, s.end_time),
      });
    }

    // sort within each day by start_time
    for (const day of Object.keys(out)) {
      out[day].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    }

    return out;
  }, [slots]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Keep your existing email send
    sendTableEmail(formData.email, formData.message);

    alert(
      `Message sent to ${tutor.name}!\n\nYour details:\nName: ${formData.name}\nEmail: ${formData.email}\nInstrument: ${formData.instrument}`
    );
    onClose();
  };

  async function book(slotId) {
    try {
      const res = await fetch(`/api/availability/${slotId}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1 }), // demo user
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(payload.error || "Failed to book");
        return;
      }

      // update local state for that slot
      setSlots((prev) =>
        prev.map((x) =>
          x.availability_id === payload.availability_id ? payload : x
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to book (network/server error)");
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contact {tutor.name}</DialogTitle>
          <DialogDescription>
            Send a message to inquire about music lessons. They'll get back to
            you soon!
          </DialogDescription>
        </DialogHeader>

        {/* Availability section (simplified but with booking) */}
        <div className="space-y-2 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Available times</h4>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No availability posted yet.
            </p>
          ) : (
            <div className="space-y-3">
              {DAYS.filter((d) => grouped[d]?.length).map((day) => (
                <div key={day} className="rounded-md border px-3 py-2">
                  <div className="text-sm font-medium mb-2">{day}</div>

                  <div className="space-y-2">
                    {grouped[day].map((s) => (
                      <div
                        key={s.availability_id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <div>
                          {s._time} · {s._dur} min{" "}
                          <span className="text-xs text-muted-foreground">
                            ({s.is_booked ? "Booked" : "Open"})
                          </span>
                        </div>

                        {!s.is_booked ? (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => book(s.availability_id)}
                          >
                            Book
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="0412 345 678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instrument">Instrument of Interest *</Label>
            <Select
              value={formData.instrument}
              onValueChange={(value) => handleChange("instrument", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an instrument" />
              </SelectTrigger>
              <SelectContent>
                {(tutor.instruments || []).map((instrument) => (
                  <SelectItem key={instrument} value={instrument}>
                    {instrument}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Tell the tutor about your experience level and what you'd like to learn..."
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Send Message</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
