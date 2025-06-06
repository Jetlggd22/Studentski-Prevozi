// src/api/services/lokacijaService.js

import * as lokacijaRepository from '../repositories/lokacijaRepository.js'; // << NOVO: Ustvarite to datoteko

export async function findLokacijeByName(query) {
  if (typeof query !== 'string') {
     // Osnovno preverjanje tipa, lahko dodate več validacije
     return [];
  }
  return await lokacijaRepository.searchLokacijeByName(query);
}