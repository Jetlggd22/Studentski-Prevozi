import * as rezervacijaService from '../services/rezervacijaService.js';

/**
 * Ustvari novo rezervacijo.
 */
export async function createRezervacija(req, res, next) {
  try {
    const { TK_Prevoz, TK_Potnik } = req.body;

    if (!TK_Prevoz || !TK_Potnik) {
      return res.status(400).json({ success: false, message: 'Manjkajoči podatki: TK_Prevoz in TK_Potnik sta obvezna.' });
    }

    const rezervacijaId = await rezervacijaService.createRezervacija({ TK_Prevoz, TK_Potnik });
    res.status(201).json({ success: true, message: 'Rezervacija uspešno ustvarjena.', data: { idRezervacija: rezervacijaId } });
  } catch (error) {
    // Posebno obravnavanje za znane napake
    if (error.message === 'Prevoz ne obstaja.' || 
        error.message === 'Ni prostih mest za ta prevoz.' ||
        error.message === 'Za ta prevoz že imate rezervacijo.' ||
        error.message === 'Voznik ne more rezervirati lastnega prevoza.') {
      return res.status(400).json({ success: false, message: error.message });
    }
    // Za druge napake, posreduj generičnemu error handlerju
    next(error); 
  }
}


/**
 * Prekliče rezervacijo.
 */
export async function prekliciRezervacija(req, res, next) {
  try {
    const { idRezervacija } = req.params;
    // Opomba: V produkcijskem okolju bi tukaj preverili, ali prijavljeni uporabnik sme preklicati to rezervacijo.
    if (!idRezervacija) {
      return res.status(400).json({ success: false, message: 'Manjka ID rezervacije.' });
    }
    const result = await rezervacijaService.prekliciUserRezervacija(parseInt(idRezervacija));
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    if (error.message === 'Rezervacija za preklic ni bila najdena ali pa je že preklicana.') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * Pridobi uporabnikovo rezervacijo za določen prevoz.
 */
export async function getUserRezervacijaForPrevoz(req, res, next) {
  try {
    const { idUporabnik, idPrevoz } = req.params;
    if (!idUporabnik || !idPrevoz) {
      return res.status(400).json({ success: false, message: 'Manjkata ID uporabnika ali ID prevoza.' });
    }
    const rezervacija = await rezervacijaService.fetchUserRezervacijaForPrevoz(idUporabnik, parseInt(idPrevoz));
    if (rezervacija) {
      res.status(200).json({ success: true, data: rezervacija });
    } else {
      res.status(200).json({ success: true, data: null, message: 'Uporabnik nima rezervacije za ta prevoz.' });
    }
  } catch (error) {
    next(error);
  }
}