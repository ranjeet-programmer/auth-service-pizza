import fs from 'fs';
import rsaPemToJwk from 'rsa-pem-to-jwk';

const publicKey = fs.readFileSync("./certs/public.pem", "utf8");
const jwk = rsaPemToJwk(publicKey, { use: 'sig' }, 'public');
console.log(JSON.stringify(jwk));
