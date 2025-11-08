/**
 * Worker d'authentification indépendant
 * Utilise Workers KV pour stocker les utilisateurs
 */

// Fonction pour hasher les mots de passe (simple, pour la démo)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Fonction pour générer un token de session
function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Fonction pour gérer CORS
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Gérer les requêtes OPTIONS (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    try {
      // Route: POST /auth/register - Inscription
      if (path === '/auth/register' && request.method === 'POST') {
        const body = await request.json();
        const { email, password, name } = body;

        if (!email || !password) {
          return new Response(JSON.stringify({ 
            error: 'Email et mot de passe requis' 
          }), {
            status: 400,
            headers: corsHeaders(),
          });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await env.USERS_KV.get(`user:${email}`);
        if (existingUser) {
          return new Response(JSON.stringify({ 
            error: 'Cet email est déjà utilisé' 
          }), {
            status: 409,
            headers: corsHeaders(),
          });
        }

        // Créer le nouvel utilisateur
        const hashedPassword = await hashPassword(password);
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const user = {
          id: userId,
          email,
          name: name || email.split('@')[0],
          passwordHash: hashedPassword,
          createdAt: new Date().toISOString(),
        };

        // Stocker l'utilisateur
        await env.USERS_KV.put(`user:${email}`, JSON.stringify(user));
        await env.USERS_KV.put(`userid:${userId}`, email);

        // Générer un token de session
        const token = generateToken();
        const session = {
          userId,
          email,
          name: user.name,
          createdAt: new Date().toISOString(),
        };

        // Stocker la session (expire après 30 jours)
        await env.USERS_KV.put(`session:${token}`, JSON.stringify(session), {
          expirationTtl: 60 * 60 * 24 * 30, // 30 jours
        });

        return new Response(JSON.stringify({
          success: true,
          token,
          user: {
            id: userId,
            email,
            name: user.name,
          },
        }), {
          status: 201,
          headers: corsHeaders(),
        });
      }

      // Route: POST /auth/login - Connexion
      if (path === '/auth/login' && request.method === 'POST') {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
          return new Response(JSON.stringify({ 
            error: 'Email et mot de passe requis' 
          }), {
            status: 400,
            headers: corsHeaders(),
          });
        }

        // Récupérer l'utilisateur
        const userData = await env.USERS_KV.get(`user:${email}`);
        if (!userData) {
          return new Response(JSON.stringify({ 
            error: 'Email ou mot de passe incorrect' 
          }), {
            status: 401,
            headers: corsHeaders(),
          });
        }

        const user = JSON.parse(userData);
        
        // Vérifier le mot de passe
        const hashedPassword = await hashPassword(password);
        if (user.passwordHash !== hashedPassword) {
          return new Response(JSON.stringify({ 
            error: 'Email ou mot de passe incorrect' 
          }), {
            status: 401,
            headers: corsHeaders(),
          });
        }

        // Générer un token de session
        const token = generateToken();
        const session = {
          userId: user.id,
          email: user.email,
          name: user.name,
          createdAt: new Date().toISOString(),
        };

        // Stocker la session
        await env.USERS_KV.put(`session:${token}`, JSON.stringify(session), {
          expirationTtl: 60 * 60 * 24 * 30, // 30 jours
        });

        return new Response(JSON.stringify({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        }), {
          status: 200,
          headers: corsHeaders(),
        });
      }

      // Route: GET /auth/me - Vérifier la session
      if (path === '/auth/me' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ 
            error: 'Token manquant' 
          }), {
            status: 401,
            headers: corsHeaders(),
          });
        }

        const token = authHeader.substring(7);
        const sessionData = await env.USERS_KV.get(`session:${token}`);
        
        if (!sessionData) {
          return new Response(JSON.stringify({ 
            error: 'Session invalide' 
          }), {
            status: 401,
            headers: corsHeaders(),
          });
        }

        const session = JSON.parse(sessionData);
        return new Response(JSON.stringify({
          success: true,
          user: {
            id: session.userId,
            email: session.email,
            name: session.name,
          },
        }), {
          status: 200,
          headers: corsHeaders(),
        });
      }

      // Route: POST /auth/logout - Déconnexion
      if (path === '/auth/logout' && request.method === 'POST') {
        const authHeader = request.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          await env.USERS_KV.delete(`session:${token}`);
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Déconnecté avec succès',
        }), {
          status: 200,
          headers: corsHeaders(),
        });
      }

      // Route non trouvée
      return new Response(JSON.stringify({ 
        error: 'Route non trouvée' 
      }), {
        status: 404,
        headers: corsHeaders(),
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Erreur serveur',
        message: error.message,
      }), {
        status: 500,
        headers: corsHeaders(),
      });
    }
  },
};

