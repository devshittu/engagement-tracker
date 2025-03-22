// src/app/reports/service-users/[serviceUserId]/engagement/page.tsx
import { AdmissionEngagementReport } from '@/features/Reports/components/AdmissionEngagementReport';

type EngagementPageProps = {
  params: { serviceUserId: string };
};

export default function EngagementPage({ params }: EngagementPageProps) {
  return (
    <>
      <AdmissionEngagementReport serviceUserId={params.serviceUserId} />
    </>
  );
}
