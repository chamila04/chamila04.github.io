import { useState } from 'react';
import './Hero.css';

// Import quotes directly to avoid network request and ensure instant loading
import quotes from '../../public/quotes.json';

export default function Hero({ exiting, onDismiss }) {
  const [currentQuote] = useState(() => {
    if (Array.isArray(quotes) && quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      return quotes[randomIndex];
    }
    return null;
  });

  if (!currentQuote) {
    return (
      <section id="hero" className={`hero ${exiting ? 'hero--exiting' : ''}`}>
        <div className="hero__backdrop-glow" aria-hidden="true" />
        <div className="hero__loader" aria-label="Loading quote">
          <span className="hero__loader-dot"></span>
          <span className="hero__loader-dot"></span>
          <span className="hero__loader-dot"></span>
          <span className="hero__loader-dot"></span>
          <span className="hero__loader-dot"></span>
        </div>
      </section>
    );
  }

  const words = currentQuote.quote.split(' ');
  const baseDelay = 0.15;
  const wordStep = 0.035;
  const authorDelay = baseDelay + words.length * wordStep + 0.15;
  const hintDelay = authorDelay + 0.35;

  return (
    <section
      id="hero"
      className={`hero ${exiting ? 'hero--exiting' : ''}`}
      onClick={onDismiss}
      role="banner"
      aria-label="Welcome Quote Hero Section"
    >
      <div className="hero__backdrop-glow" aria-hidden="true" />

      <div className="hero__content" onClick={(e) => e.stopPropagation()}>
        <div className="hero__quote-wrapper">
          <span
            className="hero__quote-mark hero__quote-mark--open"
            style={{ animationDelay: `${baseDelay}s` }}
            aria-hidden="true"
          >
            &ldquo;
          </span>

          <h1 className="hero__headline">
            {words.map((word, i) => (
              <span
                key={`word-${i}`}
                className="hero__word"
                style={{ animationDelay: `${baseDelay + i * wordStep}s` }}
              >
                {word}
              </span>
            ))}
          </h1>

          <span
            className="hero__quote-mark hero__quote-mark--close"
            style={{ animationDelay: `${baseDelay + words.length * wordStep}s` }}
            aria-hidden="true"
          >
            &rdquo;
          </span>
        </div>

        {currentQuote.author && (
          <p
            className="hero__author"
            style={{ animationDelay: `${authorDelay}s` }}
          >
            <span className="hero__author-dash" aria-hidden="true">&mdash;</span>
            <span className="hero__author-name">{currentQuote.author}</span>
          </p>
        )}

        <div
          className="hero__scroll-hint"
          style={{ animationDelay: `${hintDelay}s` }}
          onClick={onDismiss}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onDismiss();
            }
          }}
          aria-label="Scroll to explore portfolio"
        >
          <span className="hero__scroll-text">Scroll to explore</span>
          <div className="hero__scroll-indicator">
            <span className="hero__scroll-dot" />
          </div>
        </div>
      </div>
    </section>
  );
}



