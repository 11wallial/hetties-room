export interface Stop {
  country: string;
  city: string;
  flag: string;
  from: Date;
  to: Date;
  lat: number;
  lng: number;
  highlight: string;
}

// All times treated as start-of-day UTC
export const ITINERARY: Stop[] = [
  { country: 'Japan',    city: 'Kyoto',            flag: '🇯🇵', from: new Date('2026-04-17'), to: new Date('2026-04-23'), lat: 35.01, lng: 135.77, highlight: 'Fushimi Inari, bamboo forest, Gion' },
  { country: 'Japan',    city: 'Tokyo',            flag: '🇯🇵', from: new Date('2026-04-23'), to: new Date('2026-04-28'), lat: 35.68, lng: 139.65, highlight: 'Senso-ji, Shibuya crossing, Team Lab' },
  { country: 'Vietnam',  city: 'Hanoi',            flag: '🇻🇳', from: new Date('2026-04-28'), to: new Date('2026-05-03'), lat: 21.03, lng: 105.85, highlight: 'Ha Giang loop, Old Quarter' },
  { country: 'Vietnam',  city: 'Ninh Binh',        flag: '🇻🇳', from: new Date('2026-05-03'), to: new Date('2026-05-05'), lat: 20.25, lng: 105.97, highlight: 'kayak the paddy fields' },
  { country: 'Vietnam',  city: 'Phong Nha',        flag: '🇻🇳', from: new Date('2026-05-05'), to: new Date('2026-05-07'), lat: 17.60, lng: 106.28, highlight: 'Dark Cave zipline & mud bath' },
  { country: 'Vietnam',  city: 'Hoi An',           flag: '🇻🇳', from: new Date('2026-05-07'), to: new Date('2026-05-10'), lat: 15.88, lng: 108.34, highlight: 'lanterns, tailors, An Bang beach' },
  { country: 'Vietnam',  city: 'Da Nang',          flag: '🇻🇳', from: new Date('2026-05-10'), to: new Date('2026-05-13'), lat: 16.05, lng: 108.20, highlight: 'Golden Bridge, dragon fire show' },
  { country: 'Vietnam',  city: 'Ho Chi Minh City', flag: '🇻🇳', from: new Date('2026-05-13'), to: new Date('2026-05-15'), lat: 10.78, lng: 106.70, highlight: 'Cu Chi Tunnels, Ben Thanh Market' },
  { country: 'Laos',     city: 'Luang Prabang',    flag: '🇱🇦', from: new Date('2026-05-15'), to: new Date('2026-05-17'), lat: 19.88, lng: 102.13, highlight: 'Kuang Si waterfalls, Mekong sunset' },
  { country: 'Laos',     city: 'Nong Khiaw',       flag: '🇱🇦', from: new Date('2026-05-17'), to: new Date('2026-05-20'), lat: 20.57, lng: 102.61, highlight: 'Phadaeng Peak overnight hike' },
  { country: 'Thailand', city: 'Chiang Mai',       flag: '🇹🇭', from: new Date('2026-05-20'), to: new Date('2026-05-24'), lat: 18.79, lng: 98.99,  highlight: 'Elephant Nature Park, Doi Suthep' },
  { country: 'Thailand', city: 'Pai',              flag: '🇹🇭', from: new Date('2026-05-24'), to: new Date('2026-05-26'), lat: 19.36, lng: 98.44,  highlight: 'Pai Canyon at sunset, hot springs' },
  { country: 'Thailand', city: 'Chiang Mai',       flag: '🇹🇭', from: new Date('2026-05-26'), to: new Date('2026-05-27'), lat: 18.79, lng: 98.99,  highlight: 'Baan Kang Wat, night bus south' },
  { country: 'Thailand', city: 'Bangkok',          flag: '🇹🇭', from: new Date('2026-05-27'), to: new Date('2026-05-29'), lat: 13.76, lng: 100.50, highlight: 'Wat Pho, Grand Palace, khlongs' },
  { country: 'Thailand', city: 'Krabi',            flag: '🇹🇭', from: new Date('2026-05-29'), to: new Date('2026-05-31'), lat: 8.09,  lng: 98.91,  highlight: 'Phra Nang Cave, Four Islands' },
  { country: 'Thailand', city: 'Koh Lanta',        flag: '🇹🇭', from: new Date('2026-05-31'), to: new Date('2026-06-02'), lat: 7.57,  lng: 99.04,  highlight: 'Long Beach, Mu Koh Lanta park' },
  { country: 'Cambodia', city: 'Siem Reap',        flag: '🇰🇭', from: new Date('2026-06-02'), to: new Date('2026-06-05'), lat: 13.37, lng: 103.84, highlight: 'Angkor Wat' },
];

export function getCurrentStop(now: Date): Stop | null {
  return ITINERARY.find(s => now >= s.from && now < s.to) ?? null;
}

export function getStopIndex(stop: Stop): number {
  return ITINERARY.findIndex(s => s.from.getTime() === stop.from.getTime() && s.city === stop.city);
}

export function getNextStop(stop: Stop): Stop | null {
  const idx = getStopIndex(stop);
  return idx >= 0 && idx < ITINERARY.length - 1 ? ITINERARY[idx + 1] : null;
}

export function getDaysLeft(stop: Stop, now: Date): number {
  return Math.max(0, Math.ceil((stop.to.getTime() - now.getTime()) / 86_400_000));
}

/** Returns unique countries in order (deduped by contiguous runs) */
export function getCountryJourney(): { country: string; flag: string; from: Date; to: Date }[] {
  const result: { country: string; flag: string; from: Date; to: Date }[] = [];
  for (const s of ITINERARY) {
    const last = result[result.length - 1];
    if (last && last.country === s.country) {
      last.to = s.to;
    } else {
      result.push({ country: s.country, flag: s.flag, from: s.from, to: new Date(s.to) });
    }
  }
  return result;
}
