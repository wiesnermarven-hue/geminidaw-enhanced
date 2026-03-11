// src/modules/samplePacks.ts
export interface SamplePack {
  name: string;
  author: string;
  url: string;
  samples: Array<{
    name: string;
    kind: 'drum' | 'texture' | 'fx';
    color: string;
  }>;
}

export const samplePacks: SamplePack[] = [
  {
    name: 'Drumboii 808 Pack',
    author: 'drumboii',
    url: 'https://drumboii.com/products/free-808-sample-pack',
    samples: [
      { name: '808 Kick 1', kind: 'drum', color: '#ff9c2f' },
      { name: '808 Snare 1', kind: 'drum', color: '#c0392b' },
      { name: '808 Hat Closed 1', kind: 'drum', color: '#2980b9' },
      { name: '808 Hat Open 1', kind: 'drum', color: '#8e44ad' },
      { name: '808 Clap 1', kind: 'drum', color: '#16a085' },
      { name: '808 Perc 1', kind: 'drum', color: '#f39c12' },
    ],
  },
  {
    name: 'Ghosthack 808s 2024',
    author: 'Ghosthack',
    url: 'https://www.ghosthack.de/free_sample_packs/free-808s-2024',
    samples: [
      { name: '808 Kick GH', kind: 'drum', color: '#e74c3c' },
      { name: '808 Snare GH', kind: 'drum', color: '#9b59b6' },
      { name: '808 Hat GH', kind: 'drum', color: '#3498db' },
    ],
  },
  {
    name: 'Beatsmith 808 Kit',
    author: 'Beatsmith',
    url: 'https://soundpacks.com/free-sound-packs/808-drum-kit/',
    samples: [
      { name: '808 Kick BS', kind: 'drum', color: '#2ecc71' },
      { name: '808 Snare BS', kind: 'drum', color: '#f1c40f' },
      { name: '808 Hat BS', kind: 'drum', color: '#e67e22' },
    ],
  },
  {
    name: 'Roland TR-808 Kit',
    author: 'J5 Music',
    url: 'https://j5music.com/products/roland-tr-808-kit-sample-pack',
    samples: [
      { name: 'TR-808 Kick', kind: 'drum', color: '#ff5733' },
      { name: 'TR-808 Snare', kind: 'drum', color: '#33ff57' },
      { name: 'TR-808 Hat Closed', kind: 'drum', color: '#3357ff' },
      { name: 'TR-808 Hat Open', kind: 'drum', color: '#ff33a1' },
      { name: 'TR-808 Clap', kind: 'drum', color: '#a133ff' },
      { name: 'TR-808 Cowbell', kind: 'drum', color: '#33ffa1' },
    ],
  },
  {
    name: 'NOXU 808 Pack',
    author: 'NOXU Deep',
    url: 'https://noxudeep.com/shop/sample-packs/808-free-sample-pack/',
    samples: [
      { name: '808 Kick NOXU', kind: 'drum', color: '#ff6b6b' },
      { name: '808 Snare NOXU', kind: 'drum', color: '#4ecdc4' },
    ],
  },
  {
    name: 'HipHopMakers 808 Kit',
    author: 'HipHopMakers',
    url: 'https://hiphopmakers.com/free-808-drum-kit-227-samples',
    samples: [
      { name: '808 Kick HHM', kind: 'drum', color: '#45b7d1' },
      { name: '808 Snare HHM', kind: 'drum', color: '#f7dc6f' },
      { name: '808 Hat HHM', kind: 'drum', color: '#bb8fce' },
      // More samples assumed
    ],
  },
  {
    name: 'JF Beat 808 Slap',
    author: 'JF Beat Store',
    url: 'https://www.jfbeatpacks.com/products/free-808-slap-sample-pack',
    samples: [
      { name: '808 Slap JF', kind: 'drum', color: '#85c1e9' },
    ],
  },
  {
    name: 'Henrik Harrell 808 Day',
    author: 'Henrik Harrell',
    url: 'https://www.henrikharrell.com/free-download/808-day/',
    samples: [
      { name: '808 Day Kick', kind: 'drum', color: '#f8c471' },
      { name: '808 Day Snare', kind: 'drum', color: '#82e0aa' },
    ],
  },
];