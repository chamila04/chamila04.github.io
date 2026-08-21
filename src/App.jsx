import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Timeline from './components/Timeline';
import Contact from './components/Contact';
import './App.css';

const SECTIONS = ['about', 'journey', 'projects', 'contact'];

function App() {
  const [heroVisible, setHeroVisible] = useState(true);
  const [heroExiting, setHeroExiting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isScrollingRef = useRef(false);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);

  // Helper to check if the current section still has scrollable content in the given direction
  // direction > 0 for scrolling down, direction < 0 for scrolling up
  const canSectionScroll = useCallback((direction) => {
    const currentEl = document.getElementById(SECTIONS[currentIndex]);
    if (!currentEl) return false;
    const rect = currentEl.getBoundingClientRect();
    const tolerance = 25;

    if (direction > 0) {
      // If bottom of the current section is still below viewport bottom, let it scroll down naturally
      return rect.bottom > window.innerHeight + tolerance;
    } else if (direction < 0) {
      // If top of the current section is still above viewport top, let it scroll up naturally
      return rect.top < -tolerance;
    }
    return false;
  }, [currentIndex]);

  // Smoothly scroll to a specific section index
  const scrollToSection = useCallback((index) => {
    if (index < 0 || index >= SECTIONS.length) return;
    const targetEl = document.getElementById(SECTIONS[index]);
    if (targetEl) {
      isScrollingRef.current = true;
      setCurrentIndex(index);
      targetEl.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 750);
    }
  }, []);

  const dismissHero = useCallback(() => {
    if (!heroVisible || heroExiting) return;
    setHeroExiting(true);
    setTimeout(() => {
      setHeroVisible(false);
      setHeroExiting(false);
      setCurrentIndex(0);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 700);
  }, [heroVisible, heroExiting]);

  // Keep currentIndex in sync when user clicks navbar or scrolls
  useEffect(() => {
    const handleScrollSync = () => {
      if (isScrollingRef.current) return;
      const scrollMiddle = window.scrollY + window.innerHeight * 0.4;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i]);
        if (el && el.offsetTop <= scrollMiddle) {
          setCurrentIndex(i);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScrollSync, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSync);
  }, []);

  // Wheel listener: go straight to next / previous section with tall section support
  useEffect(() => {
    const handleWheel = (e) => {
      if (heroVisible) {
        e.preventDefault();
        if (Math.abs(e.deltaY) > 8) {
          dismissHero();
        }
        return;
      }

      if (isScrollingRef.current) {
        e.preventDefault();
        return;
      }

      // Filter micro wheel jitters
      if (Math.abs(e.deltaY) < 18) return;

      if (e.deltaY > 0) {
        if (canSectionScroll(1)) {
          return;
        }
        if (currentIndex < SECTIONS.length - 1) {
          e.preventDefault();
          scrollToSection(currentIndex + 1);
        }
      } else if (e.deltaY < 0) {
        if (canSectionScroll(-1)) {
          return;
        }
        if (currentIndex > 0) {
          e.preventDefault();
          scrollToSection(currentIndex - 1);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [heroVisible, dismissHero, currentIndex, scrollToSection, canSectionScroll]);

  // Touch listener for swipe navigation
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      if (heroVisible) {
        e.preventDefault();
        const deltaY = touchStartY.current - e.touches[0].clientY;
        if (Math.abs(deltaY) > 20) {
          dismissHero();
        }
        return;
      }

      if (isScrollingRef.current) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e) => {
      if (heroVisible || isScrollingRef.current) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      const deltaX = touchStartX.current - e.changedTouches[0].clientX;

      // Only respond if vertical swipe is dominant
      if (Math.abs(deltaY) > 40 && Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY > 0) {
          if (canSectionScroll(1)) return;
          if (currentIndex < SECTIONS.length - 1) {
            scrollToSection(currentIndex + 1);
          }
        } else if (deltaY < 0) {
          if (canSectionScroll(-1)) return;
          if (currentIndex > 0) {
            scrollToSection(currentIndex - 1);
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [heroVisible, dismissHero, currentIndex, scrollToSection, canSectionScroll]);

  // Keyboard navigation (ArrowDown, ArrowUp, PageDown, PageUp, Space)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when typing in form inputs
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (heroVisible) {
        if (['ArrowDown', 'Space', 'PageDown'].includes(e.code)) {
          e.preventDefault();
          dismissHero();
        }
        return;
      }

      if (isScrollingRef.current) {
        if (['ArrowDown', 'ArrowUp', 'Space', 'PageDown', 'PageUp'].includes(e.code)) {
          e.preventDefault();
        }
        return;
      }

      if (['ArrowDown', 'PageDown', 'Space'].includes(e.code)) {
        if (canSectionScroll(1)) return;
        if (currentIndex < SECTIONS.length - 1) {
          e.preventDefault();
          scrollToSection(currentIndex + 1);
        }
      } else if (['ArrowUp', 'PageUp'].includes(e.code)) {
        if (canSectionScroll(-1)) return;
        if (currentIndex > 0) {
          e.preventDefault();
          scrollToSection(currentIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [heroVisible, dismissHero, currentIndex, scrollToSection, canSectionScroll]);

  // Prevent body scroll while hero is visible
  useEffect(() => {
    if (heroVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [heroVisible]);

  return (
    <div className="app">
      <Navbar heroVisible={heroVisible} />
      {heroVisible && (
        <Hero exiting={heroExiting} onDismiss={dismissHero} />
      )}
      <main>
        <About />
        <Timeline />
        <Projects />
        <Contact />
      </main>
    </div>
  );
}

export default App;
