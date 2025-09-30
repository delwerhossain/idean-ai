"use client";

import { Button } from "@/components/ui/button";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  videoUrl?: string;
  steps: Array<{
    title: string;
    description: string;
  }>;
  ctaText?: string;
}

export default function TutorialModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  videoUrl = "https://www.youtube.com/embed/f0i37zHn-e0?si=TGloS0i_06ijh1Bt",
  steps,
  ctaText = "Got it, Let's Get Started!"
}: TutorialModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-idean-navy p-6 text-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon}
              <div>
                <h2 className="text-2xl font-bold">{title}</h2>
                <p className="text-blue-100 mt-1">{subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 p-0 text-white hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* YouTube Video */}
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
            <iframe
              width="100%"
              height="100%"
              src={videoUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>

          {/* Tutorial Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg mb-4">Quick Start Guide</h3>

            {steps.map((step, index) => (
              <div key={index} className="flex gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-idean-navy text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onClose}
            className="bg-idean-navy hover:bg-idean-navy-dark text-white w-full"
          >
            {ctaText}
          </Button>
        </div>
      </div>
    </div>
  );
}
