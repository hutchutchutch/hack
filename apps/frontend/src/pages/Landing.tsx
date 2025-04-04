// apps/frontend/src/pages/landing.tsx
export function Landing() {
    return (
      <div className="bg-bg-main text-text-primary min-h-screen p-4">
        <h1 className="text-xl font-bold">Welcome to Hackistan!</h1>
        <p className="text-md mt-2 text-text-secondary">
          A global community of AI engineers. Dive in to see upcoming hackathons!
        </p>
        <button className="mt-6 bg-brand-primary text-text-primary px-4 py-2 rounded hover:bg-brand-secondary transition-colors">
          Join Now
        </button>
      </div>
    );
  }
  