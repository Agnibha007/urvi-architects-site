import { useLayoutEffect, useRef } from 'react'
import { FiArrowUpRight } from 'react-icons/fi'
import { FaInstagram, FaBehance } from 'react-icons/fa6'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { reportSection } from '@/hooks/useScrollStore'
import SplitText from '@/components/SplitText'
import Reveal from '@/components/Reveal'

const NAV = [
  ['Work', '#living'],
  ['Materials', '#materials'],
  ['Process', '#blueprint'],
  ['Studio', '#hero'],
]

const SOCIAL = [
  { label: 'Instagram', href: 'https://instagram.com/', Icon: FaInstagram },
  { label: 'Behance', href: 'https://behance.net/', Icon: FaBehance },
]

/**
 * CONTACT — studio information, clean and spacious.
 *
 * Not pinned — after the held film the reader should be released.
 * Editorial layout with generous whitespace and minimal decoration.
 */
export default function Contact() {
  const root = useRef(null)
  const mark = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        mark.current,
        { yPercent: 26, opacity: 0, filter: 'blur(8px)' },
        {
          yPercent: 0,
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'apple',
          duration: 2,
          scrollTrigger: { trigger: mark.current, start: 'top 92%', once: true },
        }
      )

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 70%',
        end: 'bottom bottom',
        onUpdate: (self) => reportSection('contact', self.progress, 0),
      })
    }, root)

    return () => ctx.revert()
  }, [])

  const go = (e, href) => {
    e.preventDefault()
    window.__lenis
      ? window.__lenis.scrollTo(href, { duration: 2.6 })
      : document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer ref={root} id="contact" className="relative z-30 bg-bone px-5 sm:px-6 pb-8 sm:pb-10 pt-[12vh] sm:pt-[18vh] md:px-12 md:pb-14">
      <div className="pointer-events-none mx-auto max-w-[1400px] border-t border-ink/8 pt-10 sm:pt-12 md:pt-16">
        <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:gap-y-14 md:grid-cols-12">
          {/* Enquiries */}
          <div className="md:col-span-5">
            <p className="eyebrow mb-4 sm:mb-6 text-ink/40">Enquiries</p>
            <a
              href="tel:+919676322143"
              className="pointer-events-auto group inline-flex items-start gap-2 text-ink break-all sm:break-normal"
              style={{ fontSize: 'clamp(1.4rem, 2.8vw, 3rem)', lineHeight: 1.1, letterSpacing: '-0.03em' }}
            >
              <SplitText by="char" stagger={0.018} duration={1.1}>
                +91 96763 22143
              </SplitText>
              <FiArrowUpRight className="mt-2 shrink-0 text-accent transition-transform duration-1000 ease-subtle group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {/* Founder & Studio */}
          <Reveal variant="lines" className="md:col-span-3 md:col-start-7" stagger={0.1}>
            <p className="eyebrow mb-4 sm:mb-6 text-ink/40">Founder</p>
            <p className="body-sm text-ink/70 font-medium">
              Ismail Ahmed
            </p>
            <p className="eyebrow mt-4 sm:mt-6 mb-4 sm:mb-6 text-ink/40">Studio</p>
            <p className="body-sm text-ink/60">
              Andhra Pradesh &amp; Telangana
              <br />
              India
            </p>
          </Reveal>

          {/* Index */}
          <Reveal variant="lines" className="md:col-span-2 md:col-start-11" stagger={0.1}>
            <p className="eyebrow mb-4 sm:mb-6 text-ink/40">Index</p>
            {NAV.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={(e) => go(e, href)}
                className="pointer-events-auto body-sm block py-1 text-ink/60 transition-colors duration-700 ease-subtle hover:text-accent"
              >
                {label}
              </a>
            ))}
          </Reveal>
        </div>
      </div>

      {/* Wordmark — responsive font size */}
      <div className="pointer-events-none mx-auto mt-[10vh] sm:mt-[14vh] max-w-[1400px] overflow-hidden">
        <h2
          ref={mark}
          className="will-move whitespace-nowrap text-center font-display leading-[0.82] tracking-tightest text-ink"
          style={{ fontSize: 'clamp(2.5rem, 15.5vw, 20rem)' }}
        >
          URVI <span className="italic text-accent">ARCHITECTS</span>
        </h2>
      </div>

      {/* Base rule */}
      <div className="pointer-events-none mx-auto mt-8 sm:mt-10 flex max-w-[1400px] flex-col gap-4 sm:gap-5 border-t border-ink/8 pt-5 sm:pt-6 md:flex-row md:items-center md:justify-between">
        <p className="eyebrow text-ink/40">© {new Date().getFullYear()} Urvi Architects — All rights reserved</p>

        <div className="flex items-center gap-6 sm:gap-7">
          {SOCIAL.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="pointer-events-auto eyebrow group inline-flex items-center gap-2 text-ink/45 transition-colors duration-700 ease-subtle hover:text-accent"
            >
              <Icon className="text-[13px]" />
              {label}
            </a>
          ))}
        </div>

        <p className="eyebrow text-ink/30 md:text-right">
          Powered by <span className="text-ink/50">Solaeraab</span>
        </p>
      </div>
    </footer>
  )
}
