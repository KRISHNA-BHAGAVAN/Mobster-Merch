// router.js
import express from 'express';
import axios from 'axios';

const router = express.Router();
router.use(express.json());

// 🔹 Method to generate bearer token
async function generateToken(email, password) {
  try {
    const response = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/auth/login',
      { email, password },
      { headers: { 'Content-Type': 'routerlication/json' } }
    );

    return response.data.token; // Shiprocket returns "token"
  } catch (error) {
    console.error('Error generating token:', error.response?.data || error.message);
    throw new Error('Failed to generate token');
  }
}

// 🔹 Endpoint to create adhoc order
router.post('/create-order', async (req, res) => {
  try {
    // Replace with your Shiprocket credentials
    const email = "bhanuchennuri@gmail.com";
    const password = "Ns9&E^&4RvJ5nT5p";

    // Step 1: Generate token
    const token = await generateToken(email, password);
    console.log('Generated Token:', token);
    // Step 2: Call adhoc order API with token
    const response = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      req.body, // Order payload comes from client
      {
        headers: {
          'Content-Type': 'routerlication/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Something went wrong',
    });
  }
});

export default router;