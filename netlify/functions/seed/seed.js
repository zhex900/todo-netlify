import sequelize from "../config/database.js";
import Location from "../models/locationModel.js";
import Instrument from "../models/instrumentModel.js";
import Tutor from "../models/tutorModel.js";
import Ad from "../models/adModel.js";
import Availability from "../models/availabilityModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickMany(arr, n) {
  const copy = [...arr];
  copy.sort(() => Math.random() - 0.5);
  return copy.slice(0, n);
}

const TUTOR_NAMES = [
  "Sarah Mitchell",
  "James Lee",
  "Emily Chen",
  "Liam Thompson",
  "Olivia Martin",
  "Noah Williams",
  "Ava Johnson",
  "Ethan Brown",
  "Mia Davis",
  "Lucas Wilson",
  "Sophie Anderson",
  "Jack Taylor",
];

const LOCATIONS = [
  "Sydney CBD",
  "Newtown",
  "Surry Hills",
  "Bondi",
  "Parramatta",
  "Chatswood",
  "Manly",
  "Melbourne CBD",
  "Fitzroy",
  "Carlton",
  "St Kilda",
  "Brunswick",
];

const INSTRUMENTS = [
  "Piano",
  "Guitar",
  "Bass Guitar",
  "Violin",
  "Drums",
  "Voice",
  "Saxophone",
  "Cello",
  "Flute",
  "Clarinet",
  "Trumpet",
  "Keyboard",
];

// stable Unsplash portrait URLs so they dont change every refresh
const AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=800&h=800&fit=crop&crop=faces",
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    await sequelize.query(`
      TRUNCATE TABLE
        availabilities,
        ads,
        tutors,
        users,
        instruments,
        locations
      RESTART IDENTITY
      CASCADE;
    `);

    // Locations
    const createdLocations = await Location.bulkCreate(
      LOCATIONS.map((location_name) => ({ location_name })),
      { returning: true }
    );

    // Instruments
    const createdInstruments = await Instrument.bulkCreate(
      INSTRUMENTS.map((instrument_name) => ({ instrument_name })),
      { returning: true }
    );

    // Demo user (so Availability.user_id is valid)
    const demoUser = await User.create({
      name: "Demo User",
      email: "demo.user@example.com",
      username: "demouser",
      password: "password",
      location_id: pick(createdLocations).location_id,
    });

    const hashedPassword = await bcrypt.hash("password", 10);

    // Tutors (8)
    const tutors = await Tutor.bulkCreate(
      pickMany(TUTOR_NAMES, 8).map((name, idx) => ({
        name,
        avatar_url: AVATARS[idx % AVATARS.length],
        phone: 400000000 + idx,
        location_id: pick(createdLocations).location_id,
        email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        username: `${name.toLowerCase().replace(/\s+/g, "")}${idx}`,
        password: hashedPassword, // ✅ hashed now
        account_status: "active",
      })),
      { returning: true }
    );

    // Ads (12)
    const blurbs = [
      "Friendly lessons for beginners through advanced.",
      "Focus on technique, musicality, and confidence.",
      "Tailored practice plans and fun repertoire.",
      "Exam prep, improvisation, and songwriting available.",
      "Patient, structured, and goal-focused teaching style.",
    ];

    const ads = await Ad.bulkCreate(
      Array.from({ length: 12 }).map((_, i) => {
        const tutor = pick(tutors);
        const instrument = pick(createdInstruments);
        const location = pick(createdLocations);

        const years = 2 + (i % 15);
        const rate = 45 + i * 5;

        return {
          tutor_id: tutor.tutor_id,
          location_id: location.location_id,
          instrument_id: instrument.instrument_id,
          ad_description: `${pick(blurbs)} (${instrument.instrument_name})`,
          years_experience: years,
          hourly_rate: rate,
          img_url: tutor.avatar_url,
          destroy_at: null,
        };
      }),
      { returning: true }
    );

    // Availability (3 per ad)
    const availabilities = [];
    ads.forEach((ad) => {
      for (let i = 0; i < 3; i++) {
        const start = new Date();
        start.setDate(start.getDate() + (i + 1));
        start.setHours(18 + i, 0, 0, 0);

        const end = new Date(start);
        end.setHours(start.getHours() + 1);

        availabilities.push({
          ad_id: ad.ad_id,
          user_id: demoUser.user_id,
          start_time: start,
          end_time: end,
          is_booked: false,
          user_capacity: 1,
        });
      }
    });

    await Availability.bulkCreate(availabilities);

    console.log("🌱 Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
