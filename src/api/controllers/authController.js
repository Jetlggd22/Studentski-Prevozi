import authService from '../services/authService.js';

const createUser = async (req, res) => {
try {
    const { ime, priimek, email, geslo, telefon, username } = req.body;

    if (!ime || !priimek || !email || !geslo || !username) {
      return res.status(400).json({ success: false, message: 'Manjkajoča polja.' });
    }

    const result = await authService.createUser({ ime, priimek, email, geslo, telefon, username });

    res.status(201).json({
      success: true,
      message: 'Uporabnik uspešno registriran',
      data: result
    });
  } catch (error) {
    console.error('Napaka pri registraciji:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Napaka pri registraciji' });
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, geslo } = req.body;
    const authResult = await authService.login({ email, geslo });
    res.json({ success: true, data: authResult });
  } catch (error) {
    next(error);
  }
}


export default { createUser, loginUser };

