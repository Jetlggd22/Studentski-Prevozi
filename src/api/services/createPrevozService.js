import * as createPrevozRepository from '../repositories/createPrevozRepository.js';

export async function createPrevoz(data) {
  return await createPrevozRepository.createPrevoz(data);
}