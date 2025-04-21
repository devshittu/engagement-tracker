// src/app/reports/service-users/[serviceUserId]/engagement/page.tsx

import { AdmissionEngagementReport } from '@/features/Reports/components/AdmissionEngagementReport';

// Define the params as a Promise since this is a Server Component
type EngagementPageProps = {
  params: Promise<{ serviceUserId: string }>;
};

// Make the function async to await the params
export default async function EngagementPage({ params }: EngagementPageProps) {
  const { serviceUserId } = await params; // Await the Promise to get the actual params object
  return (
    <>
      <AdmissionEngagementReport serviceUserId={serviceUserId} />
    </>
  );
}
