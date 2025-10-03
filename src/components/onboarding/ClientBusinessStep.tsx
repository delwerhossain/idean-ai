'use client'

import { Input } from '@/components/ui/input'
import { User, Building2 } from 'lucide-react'

interface ClientBusinessStepProps {
  clientName: string
  businessName: string
  onClientNameChange: (value: string) => void
  onBusinessNameChange: (value: string) => void
}

export default function ClientBusinessStep({
  clientName,
  businessName,
  onClientNameChange,
  onBusinessNameChange
}: ClientBusinessStepProps) {

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Your Full Name *
          </label>
          <Input
            placeholder="Enter your full name"
            value={clientName}
            onChange={(e) => onClientNameChange(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4 inline mr-2" />
            Business Name *
          </label>
          <Input
            placeholder="Enter your business name"
            value={businessName}
            onChange={(e) => onBusinessNameChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {businessName && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Business Name Selected</p>
              <p className="text-sm text-green-600">{businessName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}