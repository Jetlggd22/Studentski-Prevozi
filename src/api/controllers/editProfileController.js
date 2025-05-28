import * as userService from '../services/editProfileService.js';

export async function updateUser(req, res) {
  try {
    const userId = req.params.id;
    const userData = req.body;
    const success = await userService.updateUser(userId, userData);
    if (success) {
      const updatedUser = await userService.getUserById(userId);
      res.json({ success: true, user: updatedUser });
    } else {
      res.status(400).json({ success: false, message: 'Uporabnik ni bil posodobljen.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Napaka pri posodabljanju uporabnika.' });
  }
}