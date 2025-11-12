// CORS configuration helper

/**
 * Get allowed origins from environment variable
 */
export function getAllowedOrigins(): string[] {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  }
  
  // Default to localhost for development
  if (process.env.NODE_ENV === 'development') {
    return ['http://localhost:3000', 'http://localhost:3001'];
  }
  
  // Production: require ALLOWED_ORIGINS to be set
  return [];
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) {
    return false;
  }
  
  const allowedOrigins = getAllowedOrigins();
  
  // If no origins configured in production, deny all
  if (allowedOrigins.length === 0 && process.env.NODE_ENV === 'production') {
    return false;
  }
  
  return allowedOrigins.includes(origin);
}

/**
 * Get CORS headers for a request
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  };
  
  if (isOriginAllowed(origin) && origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (process.env.NODE_ENV === 'development') {
    // Allow localhost in development even if not explicitly configured
    headers['Access-Control-Allow-Origin'] = origin || 'http://localhost:3000';
  }
  
  return headers;
}

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflight(origin: string | null) {
  if (!isOriginAllowed(origin) && process.env.NODE_ENV === 'production') {
    return new Response(null, {
      status: 403,
      statusText: 'Forbidden - Origin not allowed',
    });
  }
  
  const headers = getCorsHeaders(origin);
  
  return new Response(null, {
    status: 204,
    headers,
  });
}

