// components/landing/StructuredData.tsx

export function StructuredData() {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'Ascent Ledger',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'Web',
      'description': 'AI Mentorship OS that turns career fog into a flight plan. Stop mistaking motion for progress.',
      'url': 'https://ascentledger.com',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.8',
        'ratingCount': '87',
        'bestRating': '5',
        'worstRating': '1',
      },
      'featureList': [
        'Vision Canvas for strategic clarity',
        'Strategic Log for progress tracking',
        'Fog Check for AI-powered insights',
        'Career trajectory mapping',
        'Context switching reduction',
      ],
      'screenshot': {
        '@type': 'ImageObject',
        'url': 'https://ascentledger.com/og-image.jpg',
        'caption': 'Ascent Ledger Dashboard - Cockpit for Career Clarity',
      },
    };
  
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        key="structured-data"
      />
    );
  }