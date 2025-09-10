import DashboardLayout from '@/components/layout/DashboardLayout'
import { BusinessProvider } from '@/lib/contexts/BusinessContext'

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BusinessProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </BusinessProvider>
  )
}