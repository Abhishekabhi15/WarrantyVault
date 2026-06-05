import { PageIntro } from '@/components/ui/PageIntro';

export function ProfilePage() {
  return (
    <section className="stack-page">
      <PageIntro
        eyebrow="Account"
        title="Profile Page"
        description="Placeholder account area for personal details, preferences, and notification settings."
      />

      <div className="detail-card">
        <span>Profile Summary</span>
        <strong>Phase 1 placeholder</strong>
        <p>
          This route is ready for user profile editing once backend services are
          available.
        </p>
      </div>
    </section>
  );
}
