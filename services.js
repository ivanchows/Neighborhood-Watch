async function getServicesByZip(zip) {
  // Step 1: Convert ZIP code to latitude/longitude using Nominatim
  let geoUrl = 'https://nominatim.openstreetmap.org/search?postalcode=' + zip + '&country=US&format=json&limit=1';

  let geoResponse = await fetch(geoUrl, {
    headers: { 'User-Agent': 'SentryNeighborhoodWatch/1.0 (cs546project)' }
  });

  if (!geoResponse.ok) {
    throw 'Could not reach geocoding service. Please try again.';
  }

  let geoText = await geoResponse.text();
  let geoData;
  try {
    geoData = JSON.parse(geoText);
  } catch (_) {
    throw 'Geocoding service returned an unexpected response. Please try again.';
  }

  if (!geoData || geoData.length === 0) {
    throw 'ZIP code ' + zip + ' could not be found.';
  }

  let lat = geoData[0].lat;
  let lon = geoData[0].lon;
  let radiusInMeters = 10000; // 10km radius

  // Step 2: Query OpenStreetMap for nearby emergency services
  let query =
    '[out:json][timeout:30];' +
    '(' +
    'node["amenity"~"^(police|fire_station|hospital|urgent_care)$"](around:' + radiusInMeters + ',' + lat + ',' + lon + ');' +
    'way["amenity"~"^(police|fire_station|hospital|urgent_care)$"](around:' + radiusInMeters + ',' + lat + ',' + lon + ');' +
    ');' +
    'out center;';

  let overpassResponse = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(query)
  });

  if (!overpassResponse.ok) {
    throw 'Service data is temporarily unavailable (status ' + overpassResponse.status + '). Please try again in a moment.';
  }

  let overpassText = await overpassResponse.text();
  let overpassData;
  try {
    overpassData = JSON.parse(overpassText);
  } catch (_) {
    throw 'Service data returned an unexpected format. Please try again in a moment.';
  }

  let elements = overpassData.elements || [];

  // Step 3: Sort results into categories
  let police = [];
  let fire = [];
  let hospital = [];
  let urgentCare = [];

  for (let i = 0; i < elements.length; i++) {
    let el = elements[i];
    let tags = el.tags || {};

    let name = tags.name || 'Unnamed';
    let phone = tags.phone || tags['contact:phone'] || null;

    let addressParts = [];
    if (tags['addr:housenumber']) addressParts.push(tags['addr:housenumber']);
    if (tags['addr:street']) addressParts.push(tags['addr:street']);
    if (tags['addr:city']) addressParts.push(tags['addr:city']);
    if (tags['addr:state']) addressParts.push(tags['addr:state']);
    let address = addressParts.length > 0 ? addressParts.join(' ') : null;

    let entry = { name: name, phone: phone, address: address };

    if (tags.amenity === 'police') {
      police.push(entry);
    } else if (tags.amenity === 'fire_station') {
      fire.push(entry);
    } else if (tags.amenity === 'hospital') {
      hospital.push(entry);
    } else if (tags.amenity === 'urgent_care') {
      urgentCare.push(entry);
    }
  }

  return {
    police: police,
    fire: fire,
    hospital: hospital,
    urgentCare: urgentCare
  };
}

export { getServicesByZip };
