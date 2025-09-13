● Looking at the copywriting page code, here's how the ID gets passed to the modal:

  ID Flow in Copywriting Page:

  1. Data Loading:

  // Line 57-66: API call loads real copywriting data with UUIDs
  const response = await ideanApi.copywriting.getAll({
    limit: 50,
    search: searchTerm
  })
  const copywritingData = response.data?.data || []
  setCopywritings(copywritingData)  // Contains real UUIDs like "d8e6ab29-4bcc-4320-8a66-f7e5bd6540dd"

  2. Click Handler:

  // When user clicks "Generate Copy" button on a backend framework card
  const handleCopywritingClick = (copywriting: Copywriting) => {
    setSelectedCopywriting(copywriting)  // copywriting.id = UUID from database
    setSelectedFramework(null)
    setShowGenerationModal(true)
  }

  3. Modal Rendering:

  // Line 331-340: Button click passes the copywriting object with UUID
  <Button
    size="sm"
    variant="outline"
    onClick={() => handleCopywritingClick(copywriting)}  // copywriting.id = UUID
  >
    Generate Copy
  </Button>

  // Modal receives the copywriting object with real UUID
  <GenerationModal
    isOpen={showGenerationModal}
    onClose={() => setShowGenerationModal(false)}
    framework={selectedFramework}        // null for backend frameworks
    copywriting={selectedCopywriting}    // Contains {id: "d8e6ab29-4bcc-4320-8a66-f7e5bd6540dd", ...}
  />

  4. Modal Uses the ID:

  In GenerationModal.tsx:
  // Line 170: Uses copywriting.id (the UUID) for API call
  const response = await ideanApi.copywriting.generate(copywriting.id, apiPayload)

  Summary:
  - Backend frameworks → copywriting.id = Real UUID from database
  - Predefined frameworks → copywriting = null, uses mock generation
  - The UUID flows: Database → API response → setState → Modal → API call