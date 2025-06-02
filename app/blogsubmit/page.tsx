import { Suspense } from 'react';
import BlogSubmitPage from './_BlogSubmitInner';

export default function PageWrapper() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <BlogSubmitPage />
    </Suspense>
  );
}
