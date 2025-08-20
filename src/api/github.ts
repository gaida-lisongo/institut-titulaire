import crypto from "crypto";
import { spawn } from "child_process";

export const config = {
  api: {
    bodyParser: false, // important pour récupérer le raw body
  },
};

const SECRET = "inbtp-vps-2025";

function verifySignature(rawBody: Buffer, signature: string | string[] | undefined) {
  if (!signature || typeof signature !== "string") return false;
  const hmac = crypto.createHmac("sha256", SECRET);
  const digest = "sha256=" + hmac.update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Helper pour lire le body brut
async function getRawBody(req: any) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const signature = req.headers["x-hub-signature-256"];
  const rawBody = await getRawBody(req);

  if (!verifySignature(rawBody, signature)) {
    return res.status(401).send("Invalid signature");
  }

  console.log("✅ Webhook Next.js validé, lancement du déploiement...");

  // Lancer le script de déploiement (ex: ./deploy.sh)
  const deploy = spawn("sh", ["./deploy.sh"]);

  deploy.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  deploy.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  deploy.on("close", (code) => {
    console.log(`Déploiement terminé avec le code ${code}`);
  });

  res.status(200).send("Déploiement lancé");
}
