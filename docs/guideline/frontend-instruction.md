# aiBuddy Frontend Optimization Guide

## Core Principle: Minimize Client-Side JavaScript

The goal is to keep as much rendering on the server as possible, only using `'use client'` for truly interactive elements.

---

## 1. Component Architecture Strategy

### Server-First Approach
```typescript
// ❌ BAD: Entire page as client component
'use client'
const ServicesPage = () => {
  const [activeTab, setActiveTab] = useState(0)
  return (
    <div>
      <Hero />
      <ServiceTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ServiceGrid />
      <ContactForm />
    </div>
  )
}

// ✅ GOOD: Only interactive parts are client
// app/(marketing)/services/page.tsx
const ServicesPage = async () => {
  const services = await getServices() // Server-side data fetching
  
  return (
    <div>
      <Hero />                    {/* Server Component */}
      <ServiceTabsWrapper />      {/* Client wrapper only */}
      <ServiceGrid data={services} /> {/* Server Component */}
      <ContactFormWrapper />      {/* Client wrapper only */}
    </div>
  )
}
```

### Component Splitting Pattern
```typescript
// components/sections/ServiceTabs/index.tsx (Server Component)
export const ServiceTabsWrapper = () => {
  return (
    <section className="py-16">
      <ServiceTabsClient /> {/* Only this is client */}
    </section>
  )
}

// components/sections/ServiceTabs/ServiceTabsClient.tsx
'use client'
export const ServiceTabsClient = () => {
  const [activeTab, setActiveTab] = useState(0)
  // Only the interactive logic here
  return <div>{/* Tab UI */}</div>
}
```

---

## 2. Granular Client Components

### Button Example
```typescript
// ❌ BAD: Entire hero section as client
'use client'
export const Hero = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  return (
    <section>
      <h1>Welcome to aiBuddy</h1>
      <p>Description text...</p>
      <button onClick={() => setIsVideoPlaying(true)}>Play Video</button>
    </section>
  )
}

// ✅ GOOD: Only button is client
// components/sections/Hero/index.tsx (Server Component)
export const Hero = () => {
  return (
    <section>
      <h1>Welcome to aiBuddy</h1>
      <p>Description text...</p>
      <PlayVideoButton /> {/* Only this is client */}
    </section>
  )
}

// components/sections/Hero/PlayVideoButton.tsx
'use client'
export const PlayVideoButton = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  return (
    <button onClick={() => setIsPlaying(true)}>
      {isPlaying ? 'Playing...' : 'Play Video'}
    </button>
  )
}
```

### Form Splitting
```typescript
// components/forms/ConsultationForm/index.tsx (Server Component)
export const ConsultationForm = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <h2>Book a Consultation</h2>
      <p>Fill out the form below</p>
      <ConsultationFormClient /> {/* Only form logic is client */}
    </div>
  )
}

// components/forms/ConsultationForm/ConsultationFormClient.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export const ConsultationFormClient = () => {
  const form = useForm({
    resolver: zodResolver(consultationSchema)
  })
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

---

## 3. Animation Optimization

### Framer Motion Isolation
```typescript
// ❌ BAD: Entire section animated
'use client'
import { motion } from 'framer-motion'

export const ServiceCard = ({ service }) => {
  return (
    <motion.div whileHover={{ y: -4 }}>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <Link href={service.url}>Learn More</Link>
    </motion.div>
  )
}

// ✅ GOOD: Animation wrapper pattern
// components/ui/AnimatedCard/index.tsx (Server Component)
export const ServiceCard = ({ service }) => {
  return (
    <AnimatedWrapper>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <Link href={service.url}>Learn More</Link>
    </AnimatedWrapper>
  )
}

// components/ui/AnimatedCard/AnimatedWrapper.tsx
'use client'
import { motion } from 'framer-motion'

export const AnimatedWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      {children}
    </motion.div>
  )
}
```

---

## 4. Dynamic Imports & Code Splitting

### Heavy Component Loading
```typescript
// app/(marketing)/portfolio/page.tsx
import dynamic from 'next/dynamic'

// Lazy load heavy components
const ProjectGallery = dynamic(
  () => import('@/components/sections/ProjectGallery'),
  {
    loading: () => <ProjectGallerySkeleton />,
    ssr: true // Still server-render if possible
  }
)

const PortfolioPage = async () => {
  const projects = await getProjects()
  
  return (
    <main>
      <PortfolioHero />
      <ProjectGallery projects={projects} />
    </main>
  )
}
```

### Conditional Component Loading
```typescript
// components/sections/InteractiveDemo/index.tsx
'use client'
import { useState, lazy, Suspense } from 'react'

const DemoViewer = lazy(() => import('./DemoViewer'))

export const InteractiveDemo = () => {
  const [showDemo, setShowDemo] = useState(false)
  
  return (
    <div>
      <button onClick={() => setShowDemo(true)}>
        Load Interactive Demo
      </button>
      
      {showDemo && (
        <Suspense fallback={<DemoSkeleton />}>
          <DemoViewer />
        </Suspense>
      )}
    </div>
  )
}
```

---

## 5. Adaptive Hydration Strategy

### Network-Aware Loading
```typescript
// hooks/useAdaptiveHydration.ts
'use client'
export const useAdaptiveHydration = () => {
  const [shouldHydrate, setShouldHydrate] = useState(false)
  
  useEffect(() => {
    // Check network speed
    const connection = (navigator as any).connection
    const isSlowNetwork = connection?.effectiveType === '2g' || 
                         connection?.effectiveType === 'slow-2g'
    
    if (isSlowNetwork) {
      // Delay hydration for slow networks
      setTimeout(() => setShouldHydrate(true), 2000)
    } else {
      setShouldHydrate(true)
    }
  }, [])
  
  return shouldHydrate
}

// Usage in component
'use client'
export const HeavyInteractiveSection = () => {
  const shouldHydrate = useAdaptiveHydration()
  
  if (!shouldHydrate) {
    return <StaticFallback />
  }
  
  return <FullInteractiveComponent />
}
```

### Progressive Enhancement
```typescript
// components/ui/ProgressiveImage/index.tsx (Server Component)
export const ProgressiveImage = ({ src, alt, ...props }) => {
  return (
    <>
      <img src={src} alt={alt} {...props} />
      <ImageInteractions src={src} /> {/* Client enhancement */}
    </>
  )
}

// components/ui/ProgressiveImage/ImageInteractions.tsx
'use client'
export const ImageInteractions = ({ src }) => {
  const [isZoomed, setIsZoomed] = useState(false)
  
  // Only enhance if JavaScript loads
  return (
    <button 
      className="absolute top-2 right-2 opacity-0 hover:opacity-100"
      onClick={() => setIsZoomed(true)}
    >
      Zoom
    </button>
  )
}
```

---

## 6. aiBuddy-Specific Implementations

### Homepage Optimization
```typescript
// app/(marketing)/page.tsx (Server Component)
import { HeroSection } from '@/components/sections/Hero'
import { ServicesGrid } from '@/components/sections/ServicesGrid'
import { ProjectShowcase } from '@/components/sections/ProjectShowcase'
import { TestimonialsCarousel } from '@/components/sections/Testimonials'

const HomePage = async () => {
  // All data fetching on server
  const [services, projects, testimonials] = await Promise.all([
    getServices(),
    getFeaturedProjects(),
    getTestimonials()
  ])
  
  return (
    <main>
      <HeroSection />
      <ServicesGrid services={services} />
      <ProjectShowcase projects={projects} />
      <TestimonialsCarousel testimonials={testimonials} />
    </main>
  )
}

// components/sections/Testimonials/index.tsx (Server Component)
export const TestimonialsCarousel = ({ testimonials }) => {
  return (
    <section className="py-20">
      <h2>What Our Clients Say</h2>
      <CarouselClient testimonials={testimonials} />
    </section>
  )
}

// components/sections/Testimonials/CarouselClient.tsx
'use client'
import { useState } from 'react'

export const CarouselClient = ({ testimonials }) => {
  const [current, setCurrent] = useState(0)
  
  // Only carousel logic is client-side
  return (
    <div>
      {testimonials[current]}
      <button onClick={() => setCurrent(prev => prev + 1)}>Next</button>
    </div>
  )
}
```

### Contact Form Pattern
```typescript
// app/(marketing)/contact/page.tsx (Server Component)
const ContactPage = () => {
  return (
    <main>
      <ContactHero />
      <div className="grid md:grid-cols-2 gap-12">
        <ContactInfo />         {/* Server Component */}
        <ContactFormWrapper />  {/* Client wrapper only */}
      </div>
    </main>
  )
}

// components/forms/ContactForm/index.tsx (Server Component)
export const ContactFormWrapper = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow">
      <h3>Send us a message</h3>
      <ContactFormClient />
    </div>
  )
}

// components/forms/ContactForm/ContactFormClient.tsx
'use client'
export const ContactFormClient = () => {
  // Form logic only
}
```

---

## 7. Performance Monitoring

### Component Load Tracking
```typescript
// utils/performance.ts
'use client'
export const trackComponentLoad = (componentName: string) => {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(`${componentName}-start`)
    
    return () => {
      performance.mark(`${componentName}-end`)
      performance.measure(
        componentName,
        `${componentName}-start`,
        `${componentName}-end`
      )
      
      const measure = performance.getEntriesByName(componentName)[0]
      console.log(`${componentName} loaded in ${measure.duration}ms`)
    }
  }
}
```

---

## 8. Bundle Size Optimization

### Import Specific Components
```typescript
// ❌ BAD: Import entire library
import * as Icons from 'lucide-react'

// ✅ GOOD: Import only what's needed
import { ChevronRight, Menu, X } from 'lucide-react'
```

### Tree Shaking Optimization
```typescript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-*'
    ]
  }
}
```

---

## 9. Prefetching Strategy

### Smart Link Prefetching
```typescript
// components/ui/SmartLink.tsx
'use client'
import Link from 'next/link'
import { useInView } from 'react-intersection-observer'

export const SmartLink = ({ href, children, ...props }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '50px'
  })
  
  return (
    <Link 
      ref={ref}
      href={href}
      prefetch={inView} // Only prefetch when near viewport
      {...props}
    >
      {children}
    </Link>
  )
}
```

---

## 10. Testing Client Optimization

### Performance Testing
```typescript
// __tests__/performance/client-components.test.ts
describe('Client Component Optimization', () => {
  it('should minimize client bundle size', () => {
    const clientComponents = getClientComponents()
    expect(clientComponents.length).toBeLessThan(20)
  })
  
  it('should lazy load heavy components', () => {
    const dynamicImports = getDynamicImports()
    expect(dynamicImports).toContain('ProjectGallery')
    expect(dynamicImports).toContain('InteractiveDemo')
  })
})
```

---

## Key Metrics to Monitor

1. **First Load JS**: Keep under 100KB
2. **Total Blocking Time**: Under 300ms
3. **Hydration Time**: Under 500ms
4. **Client Components**: Less than 30% of total components

## Development Checklist

- [ ] Is this component truly interactive?
- [ ] Can I move state management closer to where it's needed?
- [ ] Have I split large client components?
- [ ] Are heavy components dynamically imported?
- [ ] Is data fetching happening on the server?
- [ ] Have I tested on slow networks?
- [ ] Are animations isolated to small wrappers?

## Common Patterns Reference

| Use Case | Server Component | Client Wrapper |
|----------|------------------|----------------|
| Static Content | ✅ Entire component | ❌ Not needed |
| Form | ✅ Layout & labels | ✅ Input handling only |
| Animation | ✅ Content | ✅ Motion wrapper only |
| Data Display | ✅ Entire component | ❌ Not needed |
| Interactive Gallery | ✅ Initial render | ✅ Interaction layer |
| Navigation | ✅ Links & structure | ✅ Mobile menu toggle only |