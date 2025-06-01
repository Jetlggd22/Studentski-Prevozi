import * as rezervacijaRepository from '../repositories/rezervacijaRepository.js';
import * as rideRepository from '../repositories/rideRepository.js'; // Za preverjanje prostih mest

/**
 * Ustvari novo rezervacijo.
 * @param {object} data Podatki za rezervacijo.
 * @param {number} data.TK_Prevoz ID prevoza.
 * @param {string} data.TK_Potnik ID potnika.
 * @returns {Promise<number>} ID ustvarjene rezervacije.
 */
export async function createRezervacija(data) {
  const { TK_Prevoz, TK_Potnik } = data;

  // 1. Preveri, če prevoz obstaja in ima prosta mesta
  const prevoz = await rideRepository.findPrevozById(TK_Prevoz);
  if (!prevoz) {
    throw new Error('Prevoz ne obstaja.');
  }
  if (prevoz.Prosta_mesta <= 0) {
    throw new Error('Ni prostih mest za ta prevoz.');
  }

  // 2. Preveri, če uporabnik že ima rezervacijo za ta prevoz
  const existingReservation = await rezervacijaRepository.checkIfReservationExists(TK_Prevoz, TK_Potnik);
  if (existingReservation) {
    throw new Error('Za ta prevoz že imate rezervacijo.');
  }
  
  // 3. Preveri, če je potnik hkrati voznik tega prevoza
  if (prevoz.TK_Voznik === TK_Potnik) {
    throw new Error('Voznik ne more rezervirati lastnega prevoza.');
  }

  // 4. Ustvari rezervacijo (zmanjšanje Prosta_mesta se zaenkrat ne izvaja tukaj,
  // to bi bilo bolje storiti transakcijsko ali ob potrditvi rezervacije s strani voznika)
  const rezervacijaId = await rezervacijaRepository.createRezervacija({ TK_Prevoz, TK_Potnik });
  
  // Tukaj bi lahko poslali tudi obvestilo vozniku.

  return rezervacijaId;
}


/**
 * Prekliče uporabnikovo rezervacijo.
 * @param {number} idRezervacija ID rezervacije za preklic.
 * @returns {Promise<object>} Sporočilo o uspehu.
 */
export async function prekliciUserRezervacija(idRezervacija) {
  const affectedRows = await rezervacijaRepository.updateRezervacijaStatus(idRezervacija, 'odpovedano');
  if (affectedRows === 0) {
    throw new Error('Rezervacija za preklic ni bila najdena ali pa je že preklicana.');
  }
  // Opcijsko: Tukaj bi lahko povečali Prosta_mesta v tabeli Prevoz.
  // Zaenkrat to izpuščamo, da ohranimo skladnost s tem, da `createRezervacija` ne zmanjša mest takoj.
  return { message: 'Rezervacija uspešno preklicana.' };
}

/**
 * Pridobi uporabnikovo rezervacijo za določen prevoz.
 * @param {string} TK_Potnik ID potnika.
 * @param {number} TK_Prevoz ID prevoza.
 * @returns {Promise<object|null>} Podatki o rezervaciji ali null.
 */
export async function fetchUserRezervacijaForPrevoz(TK_Potnik, TK_Prevoz) {
  return await rezervacijaRepository.findUserRezervacijaForPrevoz(TK_Potnik, TK_Prevoz);
}