'use client';
/* Site-wide overlays and features, mounted once in the root layout. Each one registers itself with the
   UI provider (ui.register) so any button can open it: ui.open('planner', dest), ui.open('search') … */
import LoginFeature from './LoginFeature';
import Planner from './Planner';
import MobileSearch from './MobileSearch';
import QuickFind from './QuickFind';
import CompareTray from './CompareTray';
import Lightbox from './Lightbox';
import ReelViewer from './ReelViewer';

export default function GlobalFeatures({ CONFIG }) {
  return (
    <>
      <MobileSearch />
      <CompareTray />
      <Lightbox />
      <ReelViewer CONFIG={CONFIG} />
      <QuickFind />
      <Planner CONFIG={CONFIG} />
      <LoginFeature />
    </>
  );
}
