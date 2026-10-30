import type { RouteRecordRaw } from 'vue-router';
import LegacyIndexView from '../../views/legacy/LegacyIndexView.vue';
import DashboardView from '../../views/DashboardView.vue';
import OperationsView from '../../views/OperationsView.vue';
import FleetView from '../../views/FleetView.vue';
import TicketsView from '../../views/TicketsView.vue';
import DumpingSitesView from '../../views/DumpingSitesView.vue';
import AccountsView from '../../views/AccountsView.vue';
import LoginView from '../../views/LoginView.vue';
import LandingView from '../../views/LandingView.vue';
import HomeView from '../../views/HomeView.vue';
import DetailsView from '../../views/DetailsView.vue';
import PostsView from '../../views/PostsView.vue';
import PiniaTest from '../../views/PiniaTest.vue';
import ApiTestView from '../../views/ApiTestView.vue';
import CitizenReportView from '../../views/citizen/citizen_report.vue';
import ContractorLoginView from '../../views/auth/ContractorLogin.vue';
import EvidenceLedgerView from '../../views/contractor/EvidenceLedgerView.vue';

/**
 * Legacy/demo screens kept for reference. No auth guard — the old
 * `nasafisha_logged_in` cookie is not the active guard (see router/guards.ts).
 */
export const legacyRoutes: RouteRecordRaw[] = [
  {
    path: '/legacy',
    name: 'LegacyIndex',
    component: LegacyIndexView,
    meta: { title: 'Legacy screens' },
  },
  { path: '/legacy/dashboard', name: 'LegacyDashboard', component: DashboardView, meta: { title: 'Dashboard (legacy)' } },
  { path: '/legacy/operations', name: 'LegacyOperations', component: OperationsView, meta: { title: 'Operations (legacy)' } },
  { path: '/legacy/fleet', name: 'LegacyFleet', component: FleetView, meta: { title: 'Fleet (legacy)' } },
  { path: '/legacy/tickets', name: 'LegacyTickets', component: TicketsView, meta: { title: 'Tickets (legacy)' } },
  { path: '/legacy/dumping-sites', name: 'LegacyDumpingSites', component: DumpingSitesView, meta: { title: 'Dumping sites (legacy)' } },
  { path: '/legacy/accounts', name: 'LegacyAccounts', component: AccountsView, meta: { title: 'Accounts (legacy)' } },
  { path: '/legacy/login', name: 'LegacyLogin', component: LoginView, meta: { title: 'Login (legacy)' } },
  { path: '/legacy/landing', name: 'LegacyLanding', component: LandingView, meta: { title: 'Landing (legacy)' } },
  { path: '/legacy/home', name: 'LegacyHome', component: HomeView, meta: { title: 'Home (legacy)' } },
  { path: '/legacy/details', name: 'LegacyDetails', component: DetailsView, meta: { title: 'Details (legacy)' } },
  { path: '/legacy/posts', name: 'LegacyPosts', component: PostsView, meta: { title: 'Posts (legacy)' } },
  { path: '/legacy/pinia', name: 'LegacyPinia', component: PiniaTest, meta: { title: 'Pinia test (legacy)' } },
  { path: '/legacy/api-test', name: 'LegacyApiTest', component: ApiTestView, meta: { title: 'API test (legacy)' } },
  { path: '/legacy/citizen-report', name: 'LegacyCitizenReport', component: CitizenReportView, meta: { title: 'Citizen report (legacy)' } },
  { path: '/legacy/contractor-login', name: 'LegacyContractorLogin', component: ContractorLoginView, meta: { title: 'Contractor login (legacy)' } },
  { path: '/legacy/contractor-ledger', name: 'LegacyContractorLedger', component: EvidenceLedgerView, meta: { title: 'Contractor ledger (legacy)' } },
  // Compat aliases so links *inside* legacy screens still work.
  { path: '/dashboard', redirect: '/legacy/dashboard' },
  { path: '/operations', redirect: '/legacy/operations' },
  { path: '/fleet', redirect: '/legacy/fleet' },
  { path: '/tickets', redirect: '/legacy/tickets' },
  { path: '/dumping-sites', redirect: '/legacy/dumping-sites' },
  { path: '/accounts', redirect: '/legacy/accounts' },
];

export default legacyRoutes;
