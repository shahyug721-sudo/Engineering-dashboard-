// Seed data taken from the Engineering Dashboard PRD / reference design.
const st = (rg, ui, dev, qa, pr, regression, uat) => ({ rg, ui, dev, qa, pr, regression, uat })
const C = 'completed'
const P = 'in_progress'
const N = 'not_started'

export const SEED_OWNERS = ['Ashwinee', 'Nirav', 'Piyush', 'Tina', 'Rohit', 'Daniel']

export const SEED_PRODUCTS = [
  'GuideAlong BLUE',
  'GuideAlong RED',
  'AI',
  'Website',
  'Container Apps',
]

export const SEED_PROJECTS = [
  {
    id: 'p1',
    name: 'GA BLUE B2C IAP – iOS',
    subProject: '',
    owner: 'Ashwinee',
    product: 'GuideAlong BLUE',
    stages: st(C, C, C, C, C, C, C),
    live: true,
    targetRelease: '2025-04-16',
    currentUpdate: 'Released to the App Store. Post-launch monitoring shows stable metrics.',
    nextSteps: [{ id: 'n1', text: 'Monitor crash-free sessions', done: false }],
    lastUpdated: '2025-04-16T11:00:00',
    updatedBy: 'Ashwinee',
  },
  {
    id: 'p2',
    name: 'GA RED B2C IAP – iOS',
    subProject: '',
    owner: 'Nirav',
    product: 'GuideAlong RED',
    stages: st(C, C, C, P, N, N, N),
    live: false,
    targetRelease: '2025-06-19',
    currentUpdate:
      'Legacy issues are being resolved. Major fixes completed.\n• Audio playback issue – Fixed\n• Login improvement – In progress\n• Crash on iOS 17 – Fixed',
    nextSteps: [
      { id: 'n1', text: 'Complete QA testing', done: false },
      { id: 'n2', text: 'Internal UAT build', done: false },
      { id: 'n3', text: 'Submit for UAT', done: false },
      { id: 'n4', text: 'Release for production', done: false },
    ],
    lastUpdated: '2025-05-14T10:30:00',
    updatedBy: 'Nirav',
  },
  {
    id: 'p3',
    name: 'AI Lincoln Abe Bot',
    subProject: '',
    owner: 'Piyush',
    product: 'AI',
    stages: st(C, C, C, C, C, C, C),
    live: true,
    targetRelease: '2025-06-04',
    currentUpdate: 'Live for all users. Conversation quality improvements shipped.',
    nextSteps: [{ id: 'n1', text: 'Collect user feedback for v2', done: false }],
    lastUpdated: '2025-06-04T09:15:00',
    updatedBy: 'Piyush',
  },
  {
    id: 'p4',
    name: 'Mr. Berwind Afterlife',
    subProject: '',
    owner: 'Tina',
    product: 'AI',
    stages: st(C, C, C, C, C, P, P),
    live: false,
    targetRelease: '',
    currentUpdate: 'Regression testing underway alongside UAT preparation.',
    nextSteps: [
      { id: 'n1', text: 'Finish regression suite', done: false },
      { id: 'n2', text: 'Business sign-off on UAT', done: false },
    ],
    lastUpdated: '2025-05-12T14:20:00',
    updatedBy: 'Tina',
  },
  {
    id: 'p5',
    name: 'GA BLUE B2C IAP – Android',
    subProject: '',
    owner: 'Rohit',
    product: 'GuideAlong BLUE',
    stages: st(C, C, P, N, N, N, N),
    live: false,
    targetRelease: '',
    currentUpdate: 'Core purchase flow implementation in progress.',
    nextSteps: [
      { id: 'n1', text: 'Finish IAP integration', done: false },
      { id: 'n2', text: 'Hand off to QA', done: false },
    ],
    lastUpdated: '2025-05-10T17:45:00',
    updatedBy: 'Rohit',
  },
  {
    id: 'p6',
    name: 'GA BLUE Container – iOS',
    subProject: '',
    owner: 'Daniel',
    product: 'Container Apps',
    stages: st(C, C, C, P, P, N, P),
    live: false,
    targetRelease: '2025-06-18',
    currentUpdate: 'QA and PR review running in parallel; early UAT build shared.',
    nextSteps: [
      { id: 'n1', text: 'Close remaining QA defects', done: false },
      { id: 'n2', text: 'Merge open PRs', done: false },
      { id: 'n3', text: 'Start regression cycle', done: false },
    ],
    lastUpdated: '2025-05-13T12:05:00',
    updatedBy: 'Daniel',
  },
  {
    id: 'p7',
    name: 'Website Redesign',
    subProject: '',
    owner: 'Rohit',
    product: 'Website',
    stages: st(C, C, P, N, N, N, N),
    live: false,
    targetRelease: '2025-05-22',
    currentUpdate: 'New page templates in development.',
    nextSteps: [{ id: 'n1', text: 'Complete homepage build', done: false }],
    lastUpdated: '2025-05-11T16:00:00',
    updatedBy: 'Rohit',
  },
  {
    id: 'p8',
    name: 'AI Tour Generator',
    subProject: '',
    owner: 'Piyush',
    product: 'AI',
    stages: st(C, C, C, C, C, C, P),
    live: false,
    targetRelease: '2025-05-24',
    currentUpdate: 'UAT in progress with the content team.',
    nextSteps: [
      { id: 'n1', text: 'Resolve UAT feedback', done: false },
      { id: 'n2', text: 'Prepare production release', done: false },
    ],
    lastUpdated: '2025-05-14T09:00:00',
    updatedBy: 'Piyush',
  },
]

export const SEED = {
  projects: SEED_PROJECTS,
  owners: SEED_OWNERS,
  products: SEED_PRODUCTS,
  currentUser: 'Admin User',
  reportRecipients: 'engineering-team@company.com',
  activity: [
    {
      ts: '2025-05-14T10:30:00',
      user: 'Nirav',
      text: 'Updated "GA RED B2C IAP – iOS" – QA Testing set to In Progress',
    },
    {
      ts: '2025-05-14T09:00:00',
      user: 'Piyush',
      text: 'Updated "AI Tour Generator" – UAT set to In Progress',
    },
    {
      ts: '2025-05-13T12:05:00',
      user: 'Daniel',
      text: 'Updated "GA BLUE Container – iOS" – current update edited',
    },
  ],
}
