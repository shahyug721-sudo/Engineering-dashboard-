// Imported from "Engineering Project Updates.xlsx" → sheet "Sheet to upload".
// Stage mapping: Completed→completed, In progress→in_progress,
// Not started/blank/NA→not_started. Live column = Completed → live:true.
const C = 'completed'
const P = 'in_progress'
const N = 'not_started'
const st = (rg, ui, dev, qa, pr, reg, uat) => ({ rg, ui, dev, qa, pr, regression: reg, uat })
const STAMP = '2026-07-20T10:00:00'
const tasks = (...items) => items.filter(Boolean).map((text, i) => ({ id: 't' + i, text, done: false, at: STAMP }))

const mk = (id, name, owner, product, targetRelease, stages, live, currentUpdate, nextSteps, subProject = '') => ({
  id,
  name,
  subProject,
  owner,
  product,
  stages,
  live,
  targetRelease,
  currentUpdate,
  currentUpdateAt: currentUpdate ? STAMP : '',
  nextSteps,
  lastUpdated: STAMP,
  updatedBy: owner,
})

export const SEED_PROJECTS = [
  mk('p1', 'Bokun Connect - GA RED', 'Ashwinee', 'GA RED Container', '2026-04-07', st(C, C, C, C, C, C, C), true, '', tasks()),
  mk('p2', 'GA BLUE B2C IAP – iOS', 'Ashwinee', 'GA Blue B2C', '2026-04-16', st(C, C, C, C, C, C, C), true, '', tasks()),
  mk('p3', 'GA RED B2C IAP – iOS', 'Ashwinee', 'GA RED B2C', '2026-08-20', st(C, C, C, C, C, P, P), false, 'Currently Build is in regression testing', tasks('Submission for UAT')),
  mk('p4', 'AI Lincoln Abe Bot', 'Ashwinee', 'Afterlife', '2026-06-11', st(C, C, C, C, C, C, C), true, '', tasks()),
  mk('p5', 'Mr. Berwind Afterlife', 'Ashwinee', 'Afterlife', '2026-08-31', st(C, C, C, C, C, C, P), false, 'Take berwind live and check once', tasks('Need to send the new version to Newport with berwind smiling')),
  mk('p6', 'GA Blue - Legacy', 'Ashwinee', 'GA Blue B2C', '2026-09-30', st(N, N, N, N, N, N, N), false, 'Dev to start', tasks('Once ga blue is live dev to start')),
  mk('p7', 'GA BLUE B2C IAP – Android', 'Ashwinee', 'GA Blue B2C', '2026-12-01', st(C, N, N, N, N, N, N), false, 'Blocker from Legacy project', tasks()),
  mk('p8', 'GA BLUE Container - iOS', 'Ashwinee', 'GA Blue Container', '2026-07-22', st(C, C, C, C, C, C, P), false, 'Pre go live process', tasks('Go Live')),
  mk('p9', 'GA BLUE Container - Android', 'Ashwinee', 'GA Blue Container', '2026-07-22', st(C, C, C, C, C, C, P), false, 'Pre go live process', tasks('Go Live')),
  mk('p10', 'Geo based Push notifications', 'Ashwinee', 'All Apps', '2026-08-31', st(N, N, N, N, N, N, N), false, 'Requirements to start', tasks()),
  mk('p11', 'Social media Integration', 'Ashwinee', 'All Apps', '2026-08-31', st(C, N, N, N, N, N, N), false, 'Android dev in progress with Alex', tasks('IOS to be started')),
  mk('p12', 'Mixpanel Integration - Phase 2', 'Ashwinee', 'All Apps', '2026-09-30', st(N, N, N, N, N, N, N), false, 'to be started after GA Blue go live', tasks()),
  mk('p13', 'Appsflyer - Phase 2', 'Ashwinee', 'All Apps', '2026-08-31', st(N, N, N, N, N, N, N), false, 'to be started after GA Blue go live', tasks()),
  mk('p14', 'New Website', 'Piyush', 'ATG', '2026-08-31', st(C, P, N, N, N, N, N), false, 'Designs are being updated by designcoz', tasks('Nirav working on dev side waiting for designs')),
  mk('p15', 'TE2 Backend', 'Ashwinee', 'ATG & GA', '2026-08-31', st(C, C, P, N, N, N, N), false, 'Nirav is working on it', tasks('Update it on AWS and make live')),
  mk('p16', 'Automate EagleRider Tour Creation', 'Ashwinee', 'ATG OLD', '2026-09-15', st(C, C, P, N, N, N, N), false, 'Yug is working on it, phase 1 completed', tasks('Phase 2 to be started')),
  mk('p17', 'Images Copyright', 'Ashwinee', 'All Apps', '2026-07-30', st(C, N, P, N, N, N, N), false, 'Yug is working on images pool to be created with tour folders', tasks('To work on getting the API from Tineye')),
  mk('p18', 'Stripe Integration - GA RED iOS', 'Ashwinee', 'GA RED Container', '2026-07-30', st(C, C, C, C, C, P, N), false, 'Regression testing ongoing', tasks('Submit for UAT')),
  mk('p19', 'Stripe Integration - GA Blue iOS', 'Ashwinee', 'GA Blue Container', '2026-07-30', st(C, C, C, C, C, P, N), false, 'PR reviews ongoing', tasks('Final Regression')),
  mk('p20', 'Stripe Integration - GA RED Android', 'Ashwinee', 'GA RED Container', '2026-08-31', st(C, C, P, N, N, N, N), false, 'In Development', tasks('Testing')),
  mk('p21', 'Stripe Integration - GA Blue Android', 'Ashwinee', 'GA Blue Container', '2026-08-31', st(C, C, P, N, N, N, N), false, 'In Development', tasks('Testing')),
  mk('p22', 'CarPlay – iOS', 'Ashwinee', 'ATG & GA', '2026-09-30', st(P, N, N, N, N, N, N), false, 'Requirements and reseach in progress', tasks('Start the development')),
  mk('p23', 'Android Auto', 'Ashwinee', 'ATG & GA', '2026-09-30', st(N, N, N, N, N, N, N), false, 'Not started', tasks('Research and BRD')),
  mk('p24', 'Graphics Maps - ATG', 'Ashwinee', 'ATG', '2026-09-30', st(C, P, N, N, N, N, N), false, 'Not started', tasks('Start with first template')),
  mk('p25', 'Graphics Maps - GA', 'Ashwinee', 'GA', '2026-09-30', st(C, P, N, N, N, N, N), false, 'First draft shared by Delhi team', tasks('Approve first draft and share the rest of the tours')),
]

export const SEED_OWNERS = ['Ashwinee', 'Piyush']

export const SEED_PRODUCTS = [
  'GA RED Container',
  'GA Blue B2C',
  'GA RED B2C',
  'Afterlife',
  'GA Blue Container',
  'All Apps',
  'ATG',
  'ATG & GA',
  'ATG OLD',
  'GA',
]

export const SEED = {
  projects: SEED_PROJECTS,
  owners: SEED_OWNERS,
  products: SEED_PRODUCTS,
  currentUser: 'Admin User',
  reportRecipients: '',
  activity: [],
}
