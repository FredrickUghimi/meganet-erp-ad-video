// Dumps the sound-effect cue list from src/pm/timing.ts to JSON (used by scripts/pm_audio.py).
// usage: node scripts/pm_cues.mjs > cues.json
import {CUES, SCENES} from '../src/pm/timing.ts';
process.stdout.write(JSON.stringify({scenes: SCENES, cues: CUES}, null, 1));
