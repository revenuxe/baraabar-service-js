import { LandingPage } from '../landing-page';
import { PageSchema } from '../page-schema';
import { pageMetadata } from '../../lib/seo';
export const metadata = pageMetadata('/washing-machine-repair-bangalore');
export default function BangalorePage() {
  return <><PageSchema path="/washing-machine-repair-bangalore"/><LandingPage bangalore/></>;
}
