/**
 * Cloudflare Worker pour Medusa
 * 
 * ⚠️ ATTENTION: Cette implémentation est limitée car:
 * - Workers ne supporte pas Node.js complet
 * - Medusa nécessite une base de données PostgreSQL
 * - Les Workers ont des limites de temps d'exécution
 * 
 * Pour une application Medusa complète, utilisez Cloudflare Tunnel à la place.
 */

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // Si MEDUSA_URL n'est pas configuré, retourner une réponse d'information
      if (!env.MEDUSA_URL) {
        return new Response(JSON.stringify({ 
          message: 'Medusa Worker is running',
          status: 'ok',
          info: 'Configure MEDUSA_URL secret to enable proxying to your Medusa instance',
          endpoint: url.pathname,
          method: request.method
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
        });
      }

      // Proxy vers votre application Medusa
      const medusaUrl = env.MEDUSA_URL;
      const targetUrl = new URL(url.pathname + url.search, medusaUrl);
      
      // Préparer les en-têtes (retirer host pour éviter les conflits)
      const headers = new Headers(request.headers);
      headers.delete('host');
      headers.set('X-Forwarded-Host', url.host);
      headers.set('X-Forwarded-Proto', url.protocol.slice(0, -1));
      
      const modifiedRequest = new Request(targetUrl, {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
      });

      // Faire la requête vers Medusa
      const response = await fetch(modifiedRequest);
      
      // Créer une nouvelle réponse avec les en-têtes CORS
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // Retourner la réponse
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message,
        stack: env.ENVIRONMENT === 'development' ? error.stack : undefined
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }
  },
};

