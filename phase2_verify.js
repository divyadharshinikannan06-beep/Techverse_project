require('dotenv').config({ path: './backend/.env' });
const { spawn } = require('child_process');
const path = require('path');
const mongoose = require('./backend/node_modules/mongoose');
const User = require('./backend/models/User');
const crypto = require('crypto');

const port = 51005;
const email = `phase2verify_${Date.now()}@test.com`;
const testUser = {
  name: 'Phase2 Verify User',
  email,
  password: 'Techverse123',
  confirmPassword: 'Techverse123',
};

function log(label, value) {
  console.log(`${label}: ${JSON.stringify(value)}`);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const serverProcess = spawn(process.execPath, [path.join(__dirname, 'backend', 'server.js')], {
    cwd: path.resolve(__dirname),
    env: {
      ...process.env,
      PORT: String(port),
      MONGODB_URI: process.env.MONGODB_URI,
      JWT_SECRET: process.env.JWT_SECRET,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let serverOutput = '';
  serverProcess.stdout.on('data', (chunk) => {
    serverOutput += chunk.toString();
    process.stdout.write(chunk);
  });
  serverProcess.stderr.on('data', (chunk) => {
    serverOutput += chunk.toString();
    process.stderr.write(chunk);
  });

  let serverReady = false;
  const deadline = Date.now() + 20000;
  while (!serverReady && Date.now() < deadline) {
    if (serverOutput.includes('TechVerse API listening on http://localhost:' + port) && serverOutput.includes('MongoDB connected successfully')) {
      serverReady = true;
      break;
    }
    await wait(250);
  }

  if (!serverReady) {
    throw new Error('Backend did not start in time. Output:\n' + serverOutput);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    const registerRes = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const registerBody = await registerRes.json();
    log('registerStatus', registerRes.status);
    log('registerBody', registerBody);

    if (registerRes.status !== 201 || !registerBody.token || !registerBody.user) {
      throw new Error('Registration failed');
    }

    const user = await User.findOne({ email: testUser.email.toLowerCase() }).lean();
    log('mongoUserExists', !!user);
    log('mongoUserFields', user ? Object.keys(user) : []);
    log('passwordIsBcrypt', !!user && typeof user.password === 'string' && user.password.startsWith('$2'));
    log('passwordPlaintext', !!user && user.password === testUser.password);

    const loginRes = await fetch(`http://localhost:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password }),
    });
    const loginBody = await loginRes.json();
    log('loginStatus', loginRes.status);
    log('loginBody', loginBody);

    const badLoginRes = await fetch(`http://localhost:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: 'WrongPassword' }),
    });
    const badLoginBody = await badLoginRes.json();
    log('badLoginStatus', badLoginRes.status);
    log('badLoginBody', badLoginBody);

    const dupRes = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const dupBody = await dupRes.json();
    log('duplicateStatus', dupRes.status);
    log('duplicateBody', dupBody);

    const validToken = registerBody.token;
    const validMeRes = await fetch(`http://localhost:${port}/api/auth/me`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const validMeBody = await validMeRes.json();
    log('meValidStatus', validMeRes.status);
    log('meValidBody', validMeBody);

    const invalidMeRes = await fetch(`http://localhost:${port}/api/auth/me`, {
      headers: { Authorization: 'Bearer invalid.token.value' },
    });
    const invalidMeBody = await invalidMeRes.json();
    log('meInvalidStatus', invalidMeRes.status);
    log('meInvalidBody', invalidMeBody);

    const noTokenRes = await fetch(`http://localhost:${port}/api/auth/me`);
    const noTokenBody = await noTokenRes.json();
    log('meMissingStatus', noTokenRes.status);
    log('meMissingBody', noTokenBody);

    const invalidEmailRes = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...testUser, email: 'bad-email', confirmPassword: 'Techverse123' }),
    });
    const invalidEmailBody = await invalidEmailRes.json();
    log('invalidEmailStatus', invalidEmailRes.status);
    log('invalidEmailBody', invalidEmailBody);

    const missingFieldsRes = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Missing' }),
    });
    const missingFieldsBody = await missingFieldsRes.json();
    log('missingFieldsStatus', missingFieldsRes.status);
    log('missingFieldsBody', missingFieldsBody);

    const userId = registerBody.user.id;
    await User.findByIdAndDelete(userId);
    log('cleanupDeleted', userId);

    const finalUser = await User.findById(userId);
    log('cleanupConfirmedMissing', !finalUser);
  } finally {
    serverProcess.kill('SIGTERM');
    await wait(1000);
    if (!serverProcess.killed) {
      serverProcess.kill('SIGKILL');
    }
    await mongoose.disconnect();
    console.log('VERIFICATION_COMPLETE');
  }
}

main().catch((error) => {
  console.error('VERIFICATION_FAILED');
  console.error(error.stack || error.message);
  process.exit(1);
});
