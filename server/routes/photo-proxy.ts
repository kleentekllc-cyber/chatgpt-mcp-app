/**
 * Photo Proxy Route
 * Proxies Google Places photo requests to hide API key from client
 */

import { Router, Request, Response } from 'express';
import { getApiKey } from '../lib/places-api-client.js';

const router = Router();

/**
 * GET /api/photo
 * Proxy for Google Places Photo API
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { reference, maxwidth, maxheight } = req.query;

    if (!reference) {
      return res.status(400).json({
        error: 'Missing photo reference parameter',
      });
    }

    const apiKey = getApiKey();
    const width = maxwidth || '400';
    const height = maxheight || '300';

    // Construct Google Places Photo API URL
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${width}&maxheight=${height}&photo_reference=${reference}&key=${apiKey}`;

    // Fetch photo from Google
    const response = await fetch(photoUrl);

    if (!response.ok) {
      console.error('Photo fetch failed:', response.status, response.statusText);
      return res.status(response.status).json({
        error: 'Failed to fetch photo',
      });
    }

    // Get content type
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Set cache headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

    // Pipe the image data to response
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Photo proxy error:', error);
    res.status(500).json({
      error: 'Failed to load photo',
    });
  }
});

export default router;
