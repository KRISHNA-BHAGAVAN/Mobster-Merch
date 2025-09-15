import express from 'express';
import axios from 'axios';

const router = express.Router();

// Pincode lookup endpoint
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    // Validate pincode (India = 6 digits)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid PIN code format' });
    }

    // Call India Post API
    const response = await axios.get(`http://www.postalpincode.in/api/pincode/${code}`);
    const data = response.data;

    if (data.Status !== "Success" || !Array.isArray(data.PostOffice) || data.PostOffice.length === 0) {
      return res.status(404).json({ error: 'Pincode not found' });
    }

    // Extract unique info (district/state/country same for all PostOffices, city = each Name)
    const district = data.PostOffice[0].District || '';
    const state = data.PostOffice[0].State || '';
    const country = data.PostOffice[0].Country || 'India';

    const cities = data.PostOffice.map(po => po.Name);

    res.json({
      pincode: code,
      cities,    // list of post office/locality names
      district,
      state,
      country
    });

  } catch (err) {
    console.error('Pincode lookup error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
