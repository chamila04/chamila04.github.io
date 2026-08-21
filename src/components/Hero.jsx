import { useState, useEffect } from 'react';
import './Hero.css';

const DEFAULT_QUOTES = [
  {
    quote: "Artificial intelligence is the new electricity.",
    author: "Andrew Ng, Co-founder of Coursera & Google Brain"
  },
  {
    quote: "Success in creating AI would be the biggest event in human history. Unfortunately, it might also be the last, unless we learn how to avoid the risks.",
    author: "Stephen Hawking"
  },
  {
    quote: "The question of whether a computer can think is no more interesting than the question of whether a submarine can swim.",
    author: "Edsger W. Dijkstra"
  },
  {
    quote: "AI is probably the most important thing humanity has ever worked on. I think of it as something more profound than electricity or fire.",
    author: "Sundar Pichai"
  },
  {
    quote: "Deep Learning is an algorithm which has no theory. Machine Learning is a theory without algorithms.",
    author: "Vladimir Vapnik"
  },
  {
    quote: "Take any problem where the human gives an answer in less than a second, and Deep Learning will eventually solve it.",
    author: "Geoffrey Hinton"
  },
  {
    quote: "Data is the new oil.",
    author: "Clive Humby"
  },
  {
    quote: "Without big data, you are blind and deaf and in the middle of a freeway.",
    author: "Geoffrey Moore"
  },
  {
    quote: "Torture the data, and it will confess to anything.",
    author: "Ronald Coase"
  }
];

function getRandomQuote(quotes = DEFAULT_QUOTES) {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex] || DEFAULT_QUOTES[0];
}

export default function Hero({ exiting, onDismiss }) {
  // Synchronously pick a random quote on initial render to prevent layout shifts & animation restarts
  const [currentQuote, setCurrentQuote] = useState(() => getRandomQuote());

  // Also fetch any dynamic quotes from quotes.json if updated
  useEffect(() => {
    fetch('/quotes.json')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((quotes) => {
        if (Array.isArray(quotes) && quotes.length > 0) {
          // If we want to randomly pick from newly loaded quotes without disturbing an active session:
          // Keep the initial quote unless it wasn't valid
        }
      })
      .catch((err) => {
        console.warn('Quotes fallback to bundled data:', err.message);
      });
  }, []);

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



