import React, { useEffect, useState } from 'react';
import { hackathonApi } from '../../../services/api';
import { Sponsor } from '../../../types/hackathon';

const SponsorsPage: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        setLoading(true);
        const data = await hackathonApi.getSponsors();
        setSponsors(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching sponsors:', err);
        setError('Failed to load sponsor data');
      } finally {
        setLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  // Group sponsors by tier
  const platinumSponsors = sponsors.filter(s => s.tier === 'platinum');
  const goldSponsors = sponsors.filter(s => s.tier === 'gold');
  const silverSponsors = sponsors.filter(s => s.tier === 'silver');
  const bronzeSponsors = sponsors.filter(s => s.tier === 'bronze');

  if (loading) {
    return <div className="loading-container">Loading sponsors...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="sponsors-container">
      <header className="sponsors-header">
        <h1>Our Sponsors</h1>
        <p>This hackathon is made possible by these amazing organizations.</p>
      </header>

      {platinumSponsors.length > 0 && (
        <section className="sponsor-tier platinum">
          <h2>Platinum Sponsors</h2>
          <div className="sponsors-grid platinum-grid">
            {platinumSponsors.map(sponsor => (
              <div key={sponsor.id} className="sponsor-card platinum-sponsor">
                <div className="sponsor-logo-container">
                  {sponsor.logo ? (
                    <img src={sponsor.logo} alt={`${sponsor.name} logo`} className="sponsor-logo" />
                  ) : (
                    <div className="sponsor-logo-placeholder">{/* Placeholder for logo */}</div>
                  )}
                </div>
                <h3>{sponsor.name}</h3>
                <p className="sponsor-description">{sponsor.description}</p>
                
                {sponsor.perks && sponsor.perks.length > 0 && (
                  <div className="sponsor-perks">
                    <h4>Sponsor Perks:</h4>
                    <ul>
                      {sponsor.perks.map((perk, index) => (
                        <li key={index}>{perk}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="sponsor-link">
                  Visit Website
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {goldSponsors.length > 0 && (
        <section className="sponsor-tier gold">
          <h2>Gold Sponsors</h2>
          <div className="sponsors-grid gold-grid">
            {goldSponsors.map(sponsor => (
              <div key={sponsor.id} className="sponsor-card gold-sponsor">
                <div className="sponsor-logo-container">
                  {sponsor.logo ? (
                    <img src={sponsor.logo} alt={`${sponsor.name} logo`} className="sponsor-logo" />
                  ) : (
                    <div className="sponsor-logo-placeholder">{/* Placeholder for logo */}</div>
                  )}
                </div>
                <h3>{sponsor.name}</h3>
                <p className="sponsor-description">{sponsor.description}</p>
                
                {sponsor.perks && sponsor.perks.length > 0 && (
                  <div className="sponsor-perks">
                    <h4>Sponsor Perks:</h4>
                    <ul>
                      {sponsor.perks.map((perk, index) => (
                        <li key={index}>{perk}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="sponsor-link">
                  Visit Website
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {silverSponsors.length > 0 && (
        <section className="sponsor-tier silver">
          <h2>Silver Sponsors</h2>
          <div className="sponsors-grid silver-grid">
            {silverSponsors.map(sponsor => (
              <div key={sponsor.id} className="sponsor-card silver-sponsor">
                <div className="sponsor-logo-container">
                  {sponsor.logo ? (
                    <img src={sponsor.logo} alt={`${sponsor.name} logo`} className="sponsor-logo" />
                  ) : (
                    <div className="sponsor-logo-placeholder">{/* Placeholder for logo */}</div>
                  )}
                </div>
                <h3>{sponsor.name}</h3>
                <p className="sponsor-description">{sponsor.description}</p>
                
                <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="sponsor-link">
                  Visit Website
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {bronzeSponsors.length > 0 && (
        <section className="sponsor-tier bronze">
          <h2>Bronze Sponsors</h2>
          <div className="sponsors-grid bronze-grid">
            {bronzeSponsors.map(sponsor => (
              <div key={sponsor.id} className="sponsor-card bronze-sponsor">
                <div className="sponsor-logo-container">
                  {sponsor.logo ? (
                    <img src={sponsor.logo} alt={`${sponsor.name} logo`} className="sponsor-logo" />
                  ) : (
                    <div className="sponsor-logo-placeholder">{/* Placeholder for logo */}</div>
                  )}
                </div>
                <h3>{sponsor.name}</h3>
                <p className="sponsor-description">{sponsor.description}</p>
                
                <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="sponsor-link">
                  Visit Website
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="become-sponsor">
        <h2>Interested in Sponsoring?</h2>
        <p>Join these leading organizations in supporting innovation and talent in the AI agent space.</p>
        <p>Our sponsorship packages offer visibility, recruitment opportunities, and direct access to a community of skilled AI engineers and developers.</p>
        <button className="primary-button">Contact Us About Sponsorship</button>
      </section>
    </div>
  );
};

export default SponsorsPage;
