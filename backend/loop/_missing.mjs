import { readFileSync } from 'node:fs'
const ck = JSON.parse(readFileSync('/sessions/wonderful-admiring-ramanujan/mnt/outputs/baseline_ckpt.json','utf8'))
console.log('MISSING keys not in ckpt will be printed by chunk runner selection; ckpt keys count:', Object.keys(ck).length)
