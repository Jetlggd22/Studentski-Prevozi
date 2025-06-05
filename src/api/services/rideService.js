// src/api/services/rideService.js


export async function getPrevozById(id) {
  return await prevozRepository.findPrevozById(id);
}

export async function listPrevozi(limit = null) {
  const prevozi = await prevozRepository.getAllPrevozi(limit);
  return prevozi;
}

export async function searchPrevozi(fromLocation, toLocation) {
  const prevozi = await prevozRepository.searchPrevoziByLocation(fromLocation, toLocation);
  return prevozi;
}

export async function removePrevozById(id) {
  const affectedRows = await prevozRepository.deletePrevozById(id);
  if (affectedRows === 0) {
    return null; // Or throw an error indicating not found
  }
  return { message: 'Prevoz successfully deleted', id };
}
// ... (existing functions getPrevozById, listPrevozi, searchPrevozi, removePrevozById) ...
// You'll need access to your location creation/finding logic.
// This might involve importing from lokacijaRepository.js or having a shared location service.
// For simplicity, let's assume you have a getOrCreateLocationId function available or
// you'll adapt the one from createPrevozRepository.js.



// src/api/services/rideService.js
import * as prevozRepository from '../repositories/rideRepository.js';
// Assuming getOrCreateLocationId is correctly imported or defined elsewhere
// For example, if it's in lokacijaRepository:
import * as lokacijaRepository from '../repositories/lokacijaRepository.js'; // Ensure this path is correct
// Or if you copied/adapted it into prevozRepository and it uses pool:
// import { pool } from '../repositories/rideRepository.js'; // Or directly from '../db/pool.js'

// Placeholder for getOrCreateLocationId - ensure this is correctly implemented and imported
// This function should ideally live in lokacijaRepository.js or a shared location service
async function getOrCreateLocationId(name, longitude, latitude) {
    if (!name) return null; // Or handle as an error if name is mandatory

    // Use the actual pool instance for querying
    // If getOrCreateLocation is in lokacijaRepository:
    // return await lokacijaRepository.getOrCreateLocation(name, longitude, latitude);

    // Temporary direct implementation if not refactored yet (not recommended for production structure)
    const dbPool = prevozRepository.pool || (await import('../db/pool.js')).default; // Ensure pool is accessible

    let [locRows] = await dbPool.execute('SELECT idLokacija FROM Lokacija WHERE Ime = ?', [name]);
    if (locRows.length > 0) {
        return locRows[0].idLokacija;
    } else {
        if (!longitude || !latitude) {
            // For admin edit, they might just be renaming.
            // If creating a new location, coordinates are essential.
            // This logic needs to be robust: either fetch old coords if only name changed,
            // or require new coords if it's a genuinely new location.
            console.warn(`Creating new location '${name}' during update, but coordinates might be missing/defaulted.`);
        }
        const [result] = await dbPool.execute(
            'INSERT INTO Lokacija (Ime, Longitude, Latitude) VALUES (?, ?, ?)',
            [name, longitude || '0.000000', latitude || '0.000000'] // Provide valid defaults if necessary
        );
        return result.insertId;
    }
}


export async function updatePrevozById(rideId, rideData) {
  let tkLokacijaOdhod = rideData.TK_Lokacija_Odhod_original; // Assume you pass the original ID if name doesn't change
  let tkLokacijaPrihod = rideData.TK_Lokacija_Prihod_original;

  // Handle 'from' location update
  if (rideData.fromLocationName) {
    // If the name changed or it's a new entry, get/create its ID
    // You might need to compare rideData.fromLocationName with the original name
    // to decide if getOrCreateLocationId is truly needed or if the original ID can be kept.
    tkLokacijaOdhod = await getOrCreateLocationId(
      rideData.fromLocationName,
      rideData.fromLocationLongitude,
      rideData.fromLocationLatitude
    );
  }

  // Handle 'to' location update
  if (rideData.toLocationName) {
    tkLokacijaPrihod = await getOrCreateLocationId(
      rideData.toLocationName,
      rideData.toLocationLongitude,
      rideData.toLocationLatitude
    );
  }

  const dataToUpdate = {
    Cas_odhoda: rideData.Cas_odhoda,
    Cena: rideData.Cena,
    Prosta_mesta: rideData.Prosta_mesta,
    Ponavljanje: rideData.Ponavljanje, // Column name in DB is Ponavljanje
    // Avto: rideData.Avto, // <<< REMOVE THIS LINE or ensure Prevoz table has Avto column
    TK_Lokacija_Odhod: tkLokacijaOdhod,
    TK_Lokacija_Prihod: tkLokacijaPrihod,
    // TK_Voznik is not typically changed here.
  };

  // If you decide the Prevoz table *should* have its own Avto field:
  // 1. Add `Avto VARCHAR(45) NULL` to your Prevoz table schema (in zame.sql/db.sql and apply to DB).
  // 2. Then you can uncomment the Avto line above:
  // if (rideData.hasOwnProperty('Avto')) { // Check if Avto is explicitly sent
  //   dataToUpdate.Avto_prevoza = rideData.Avto; // Assuming column is Avto_prevoza
  // }


  // Filter out undefined properties to avoid trying to set them to NULL accidentally
  // if they weren't meant to be updated.
  const finalDataToUpdate = {};
  for (const key in dataToUpdate) {
    if (dataToUpdate[key] !== undefined) {
      finalDataToUpdate[key] = dataToUpdate[key];
    }
  }
  
  // If TK_Lokacija_Odhod or TK_Lokacija_Prihod resolved to null (e.g., error in getOrCreateLocationId)
  // you might want to prevent the update or handle it based on your business logic.
  if (finalDataToUpdate.TK_Lokacija_Odhod === null || finalDataToUpdate.TK_Lokacija_Prihod === null) {
      console.error("Location ID resolution failed. Aborting update for ride:", rideId);
      throw new Error("Napaka pri razreševanju ID-ja lokacije.");
  }


  const affectedRows = await prevozRepository.updatePrevozInDB(rideId, finalDataToUpdate);
  if (affectedRows === 0) {
    return null; 
  }
  // Return the updated ride details (you might need another fetch for this or merge data)
  const updatedRide = await prevozRepository.findPrevozById(rideId); // Fetch the full updated record
  return updatedRide;
}
