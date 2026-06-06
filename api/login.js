const admin = require('firebase-admin');

const serviceAccount = {
  projectId: "lunasystem-d05ad",
  clientEmail: "firebase-adminsdk-fbsvc@lunasystem-d05ad.iam.gserviceaccount.com",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCcUcZFY/db7RFp\nAbasL9+qrMN5GMf34w+tobLOCwqD6eX81sWrfQ/c8+kONPPrkbng2kp81ngRURu5\nd8zvdNdR9h6rOcP68GVOn2raVdnZKyvufu5EKLV293vK40XIOO75MyIesR59n7gW\nTW78XCIutDK3Ep3CChpC7Ov9CaM1Yez/V6/ixoVCYy0X+IylXiYmQuMdOrnGlTxq\nV4HsPzdc2+9GHnRAaoOHsTMRQuXZzC8/L/b53wUEYWARNaMYeFHKg3j9IiEvBlvq\nGxo/qx72Py9gWXqIWK2A8GGbCcQKL2ThUGzKh/vSwvPqB2bU+1uM/5biJilgBb51\nmALzzHMDAgMBAAECggEAJRqz+VyVJljLPSWO+qgSayy+6Uuci5Z17jzneEjeohku\n4ikImoAA9+1dcGXZUB0zBdBKxf8SWOnrrsZk+qG9SlMlTHdVsYbGRTdJ4bFnGElL\nED1IyRzwleCAndP8iF4bO0OL4cUg+6ihxYlzwqsL4hIbx6C/mYNUYHZkPZfACbdp\n1AJPQlXb54+B3NsfYx+FP2/uiwvCi1wu1FeayHdIW20btZ5xTGOb8B5XNV32MW8W\nN/rl/bRffZ6DiZgPZ7u7v0/t/zwpTkTiNBU7SZqkuwbqrf2isT+elE9+f0cgiGgh\n9BIhGklSUN+BCqb9zEsOSzbtQhFmG19x3+uALET9QQKBgQDKxOefEUnvLc7ckohp\nGYpfxF4e5QA/ioH94O483LhxcJR8A/LFq0+Kj5IXHHvRLqbQBtxdBhzBr01h39Mg\nApjaLfQL8MF6UYKjR27kjJUJ1Gp9rPMCEccCtpeJggj4zUnWLNUtOOyg0+pegLv3\nLsp2St6e/is690RqJg0uZo/9iQKBgQDFWzeZM1pA8XAFRn3TqVXof24uFfXs/C2r\qzTBJI6XzLlYOYMNQqznqUoa6GILQ+ieoGFTo6y30BM/87Y6JyI5Wu+1eLFYsGMh\FiRalOfmTUhB+lsz9LiB+qE1EK6lMp3mL3G//WQd8CMAiqsTLKkvJPKNf4z/chO5\TJ+QbMO1KwKBgAYTmI1fy0NrsANUMNpVdZwhGmD6o+NDl1mwX/Na+fwMT6bXx3K9\nC4kvfEVNCTjfmQgq7HetMzdqtXr1ZjJTYZlIP0QMVv//aVbTUTNwMxc0Umypvi6V\nsc0XA7uPNg2euVO9zDWquwymzSM/4GIr+M1KuRkyrMD7oAU+Vq7JTA9hAoGBAKRf\nbNc0Zh9g96PtKi94Ag061VGdCM7w2jj4x192Sy0zXcuVWwlYVxo7bXUrxz0Kulwj\nx+wZjmkp7F5/ZW7Z2S9cBfpnI45ymp2cC3tGOj8ebuhE1GFZmbLoRAwmcM82cTye\nl2cIbLJip0R0OjgmImMZqssfSRgYs0TKBLwNWpMxAoGAVIN9k3Y7p0vgrwvLJccx\noRYwBFqCcexJkpn3F2+TOKTwWMFh8EhCfGHDsnUnWNv92BktdnkwrZ/RgGxYhyXD\n/JMrZ822re6HklA20dkkS9NcfN2Y4mOhAjEK3O/Joop4NxHOxAMOUmjFxEwpy5D5\nLv88APKZ3h2hg7w5QzWtBUg=\n-----END PRIVATE KEY-----\n"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://lunasystem-d05ad-default-rtdb.firebaseio.com"
  });
}

const db = admin.database();

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

    const { username, password, device_info } = req.body;
    const sanitizedUser = username.replace(/[\.\#\$\[\]]/g, "").toLowerCase();

    try {
        const userRef = db.ref(`usuarios/${sanitizedUser}`);
        const snapshot = await userRef.once('value');

        if (!snapshot.exists()) {
            return res.status(401).json({ status: 'rejeitado', error: 'Usuário não existente.' });
        }

        const dataUser = snapshot.val();

        if (dataUser.password !== password) {
            return res.status(401).json({ status: 'rejeitado', error: 'Senha incorreta.' });
        }

        // Alteração de telemetria em tempo real no Realtime Database
        await userRef.update({
            status_conexao: "Online",
            aparelho_atual: device_info || "Dispositivo Android Modificado"
        });

        return res.status(200).json({
            status: 'autorizado',
            perfil: dataUser.customizacao,
            bypass_retro: dataUser.inventario
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

