import { useParams } from 'react-router-dom';
import { PageIntro } from '@/components/ui/PageIntro';

export function ProductDetailsPage() {
  const { id } = useParams();

  return (
    <section className="stack-page">
      <PageIntro
        eyebrow="Details"
        title="Product Details Page"
        description="Placeholder detail view for a single product, including warranty timeline and claim history."
      />

      <article className="detail-card">
        <span>Selected Product ID</span>
        <strong>{id}</strong>
        <p>
          Future phases can load receipts, serial numbers, warranty coverage,
          and support documents here.
        </p>
      </article>
    </section>
  );
}
