import {Router as router} from 'express';

export var killer = router();

killer.get('/killkillkill', (req, res, next) => {
  res.status(200).send('killed process');
  process.exit(0);
});

export default killer;
