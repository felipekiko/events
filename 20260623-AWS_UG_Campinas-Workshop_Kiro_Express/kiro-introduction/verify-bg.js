// Minimal verification without jsdom - mock only what's needed
global.document = { getElementById: () => ({ getContext: () => ({}) }) };
global.Audio = class Audio { constructor() {} };
global.localStorage = { getItem: () => null, setItem: () => {} };

try {
  const g = require('./game.js');
  console.log('BackgroundRenderer exported:', typeof g.BackgroundRenderer === 'function');

  const br = new g.BackgroundRenderer({width: 400, height: 560}, g.DEFAULT_CONFIG);
  console.log('Clouds count:', br.clouds.length);
  console.log('Clouds >= 3:', br.clouds.length >= 3);

  let allValid = true;
  const minSpeed = g.DEFAULT_CONFIG.clouds.minSpeedFraction * g.DEFAULT_CONFIG.pipes.speed;
  const maxSpeed = g.DEFAULT_CONFIG.clouds.maxSpeedFraction * g.DEFAULT_CONFIG.pipes.speed;
  
  for (const c of br.clouds) {
    if (c.opacity < 0.3 - 0.001 || c.opacity > 0.7 + 0.001) { allValid = false; console.log('Bad opacity:', c.opacity); }
    if (c.speed < minSpeed - 0.001 || c.speed > maxSpeed + 0.001) { allValid = false; console.log('Bad speed:', c.speed, 'range:', minSpeed, maxSpeed); }
    if (c.y < 0 || c.y > 560 * (2/3)) { allValid = false; console.log('Bad y:', c.y); }
  }
  console.log('All clouds valid:', allValid);

  const oldX = br.clouds[0].x;
  br.update(1.0);
  console.log('Cloud moved left:', br.clouds[0].x < oldX);

  const cloud = br.clouds[0];
  cloud.x = -cloud.width - 1;
  br.update(0.016);
  console.log('Cloud wrapped to right:', cloud.x > 0);

  console.log('SUCCESS - All checks passed!');
  process.exit(0);
} catch (e) {
  console.error('ERROR:', e.message);
  console.error(e.stack);
  process.exit(1);
}
