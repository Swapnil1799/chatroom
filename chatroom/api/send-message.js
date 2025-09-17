const http = require("http");
const admin = require("firebase-admin");

// ---- Firebase Admin Init without JSON file ----

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "bizfreetest",
    private_key_id: "b35fa4e3a14539cfc419dc9016c625164b05d14c",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDmGOVBeEpf1waH\nCBgtAzEjrnxMuGuZHtgxNfAT1WQF7UCqQmZz9asV3wGxAPAXlL/0adpXdlvmV4f6\n3VIyhaV6Q/2RW7pNfOjjM+sJ21yDj9/p/AcnB+mqr2la5wn3nfjy9bKY3m5q/cp6\nwCRenecnAUN3NDRqjoIXy8FNW6gOSnaAbrrFKtlvmtOC0RpM/QKKPcVOdNkZJMGG\nXF7ZUXN6HRF6k9QQegNcokGpIrXvcOzhwspjy1t6xL6BKhsaQif9zjFJiIMYGn9/\nrc2HGNMz9wGjgkeqKE2U03YQm+PCMwxb6Ne9qzKJwIF9DmGdHYwtjKduOzoFxnzg\nurqwb7znAgMBAAECggEAchsedZ0lpOmJPyVwd8IBeGRrF9DM6x40sBLDf9Juy9Gg\nI87R5+eIdEwnFpQUfF0z5A0qTf1QDaaStIFU5eEI8t0Mvizy8sJi62kvwa+a7VNI\nA00Mbvqpkg9y+7VfaABbGIFnlA+aSkyZQM5QOuurWdhykIa/B6isMwjET4yIhqzN\n5LfGHl4uh/EqlXQmqJKjtEFhAI4rHfPNGZpHaV+6I1sBGfyimrwqUlh86yNYxvr9\nXtWnUv2556M+QStNDhLbs6qAT05ULqknY88mrveP1RIs/3bOtj5fwYrJxIOQDU/y\nV0qTTUeNHUsuOu/hhplt1YVuqx3Clwb6ItHYlKAJ4QKBgQD1AejkLlg0ifiTn/o3\nJJgLuuaQY+L5qxpaYVYmAp8Z3l85n8KPQKi0nkdl005BlV3Bs+x0zx21McawcItB\nu+iz+r9Hk3OQ6+BDQeojX0WWif1DLbJWHYWxc05vaby/vOy19s92tOHZ1dzGIK9T\nGV/VWhD/juII0tkXAW87AO8prQKBgQDwa7sojiflmNoXwZPGasVYDSZ0U3coJg3Y\nPwXmIjo3DTkpIwT33/2hbnX2DXhr05IEEEpsUwINNcN/rayRpW50buRIgPBmri+q\nAai8ypuShHcw+k28k58QtcZYzELDeWFv0996nqVoq6HaYRSx5NsjkUJ3wYHa7LdC\nMP6X3S77YwKBgQDIhvqdH41T2wTXlp0NWucS2rLwxMA1xiP4iygeThD39DgOCsML\nykkKI22eWpb3OJAXBPLoG8hdz9KmAEcJ0wk/nV/G7lks6NGRWraOouBquJ/Pxuvq\nbZlJxm0Q5QL2D2PR/qKIrr0XNGHQy1mT8vWrwl6dO82mmSPTH3pxWW9ltQKBgAMf\nMv/00JnPoU1bqyKRclyRVyV9i/eOfvGG5/m0ChN67XoWRVM+qll1SLzYMe8cgTHi\nUEUV0tn/D7nRtILzpfqHEhnK6tQ6gM3xVZKWAu0lITMWnPnM5Ozfn2K5zEgjhFti\nYe2Cr90rFV/zkMQ6l4nfsgBCGACSwFJwtm2cZqbHAoGBALLgO+TnVNoR4JwoFAdd\nWywRC+GEay85ImX+LVTYguaOjZE0rytBUJ1AN3RuLxa5zvLNoyqGkwqzf794VpJY\nQgMc9+oM9QHTDiCIhhMV6SzpyZRC55IdxKUGJMS9lB0I+Pd7jcwRZHWroA+b4WFv\nUTigShtMONmOiIejTkfiTxFM\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
    client_email: "firebase-adminsdk-fbsvc@bizfreetest.iam.gserviceaccount.com",
    client_id: "102412187354700672780",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/o/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40bizfreetest.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
  }),
});

// ---- Helper function to parse JSON body ----
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
}

// ---- HTTP Server ----
const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/send-message") {
    try {
      const data = await parseBody(req);
      const { title, body } = data;

      if (!title || !body) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Title and body are required" }));
      }

      const snapshot = await admin.firestore().collection("users").get();
      const tokens = [];
      snapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.fcmToken) tokens.push(userData.fcmToken);
      });

      if (tokens.length === 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "No tokens found in Firestore" }));
      }

      const message = {
        notification: { title, body },
        tokens: tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log("📨 Notification sent:", response);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, response }));

    } catch (err) {
      console.error("❌ Error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
