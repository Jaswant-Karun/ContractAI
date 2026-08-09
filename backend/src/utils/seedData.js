const seedData = {
  companies: [
    {
      _id: '66b53a01f1e2a3b4c5d6e701',
      name: 'Acme Digital Solutions',
      settings: {
        emailNotifications: true,
        reminderDays: [90, 60, 30, 15, 7, 1]
      }
    },
    {
      _id: '66b53a01f1e2a3b4c5d6e702',
      name: 'NovaTech Systems',
      settings: {
        emailNotifications: true,
        reminderDays: [90, 60, 30, 15, 7, 1]
      }
    }
  ],
  users: [
    {
      _id: '66b53b01f1e2a3b4c5d6e801',
      name: 'Sarah Jenkins',
      email: 'admin@acme.com',
      passwordHash: 'Password123!', // Will be hashed by seed runner
      companyId: '66b53a01f1e2a3b4c5d6e701',
      role: 'Admin'
    },
    {
      _id: '66b53b01f1e2a3b4c5d6e802',
      name: 'David Miller',
      email: 'manager@acme.com',
      passwordHash: 'Password123!',
      companyId: '66b53a01f1e2a3b4c5d6e701',
      role: 'Manager'
    },
    {
      _id: '66b53b01f1e2a3b4c5d6e803',
      name: 'Elena Rostova',
      email: 'member@acme.com',
      passwordHash: 'Password123!',
      companyId: '66b53a01f1e2a3b4c5d6e701',
      role: 'Member'
    },
    {
      _id: '66b53b01f1e2a3b4c5d6e804',
      name: 'Alex Rivera',
      email: 'admin@novatech.com',
      passwordHash: 'Password123!',
      companyId: '66b53a01f1e2a3b4c5d6e702',
      role: 'Admin'
    }
  ],
  documents: [
    {
      _id: '66b53c01f1e2a3b4c5d6e901',
      companyId: '66b53a01f1e2a3b4c5d6e701',
      uploadedBy: '66b53b01f1e2a3b4c5d6e801',
      fileName: 'Cloud_Infrastructure_Services_Agreement_2025.pdf',
      fileType: 'application/pdf',
      fileSize: 2458000,
      fileUrl: 'http://localhost:5000/uploads/Cloud_Infrastructure_Services_Agreement_2025.pdf',
      status: 'completed'
    },
    {
      _id: '66b53c01f1e2a3b4c5d6e902',
      companyId: '66b53a01f1e2a3b4c5d6e701',
      uploadedBy: '66b53b01f1e2a3b4c5d6e801',
      fileName: 'Enterprise_SaaS_Master_License_Agreement.pdf',
      fileType: 'application/pdf',
      fileSize: 1840000,
      fileUrl: 'http://localhost:5000/uploads/Enterprise_SaaS_Master_License_Agreement.pdf',
      status: 'completed'
    },
    {
      _id: '66b53c01f1e2a3b4c5d6e903',
      companyId: '66b53a01f1e2a3b4c5d6e701',
      uploadedBy: '66b53b01f1e2a3b4c5d6e802',
      fileName: 'Commercial_Office_Lease_Agreement_HQ.pdf',
      fileType: 'application/pdf',
      fileSize: 3120000,
      fileUrl: 'http://localhost:5000/uploads/Commercial_Office_Lease_Agreement_HQ.pdf',
      status: 'completed'
    },
    {
      _id: '66b53c01f1e2a3b4c5d6e904',
      companyId: '66b53a01f1e2a3b4c5d6e701',
      uploadedBy: '66b53b01f1e2a3b4c5d6e801',
      fileName: 'IT_Consulting_Professional_Services_SOW.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSize: 950000,
      fileUrl: 'http://localhost:5000/uploads/IT_Consulting_Professional_Services_SOW.docx',
      status: 'completed'
    }
  ],
  contracts: [
    {
      _id: '66b53d01f1e2a3b4c5d6ea01',
      companyId: '66b53a01f1e2a3b4c5d6e701',
      documentId: '66b53c01f1e2a3b4c5d6e901',
      uploadedBy: '66b53b01f1e2a3b4c5d6e801',
      contractTitle: 'Cloud Infrastructure Master Services Agreement',
      contractType: 'Infrastructure & Hosting',
      parties: ['Acme Digital Solutions', 'AWS Cloud Platform Inc.'],
      startDate: new Date('2025-09-01'),
      expiryDate: new Date('2026-09-01'), // Expiring soon
      renewalDate: new Date('2026-08-01'),
      renewalType: 'Auto-Renew (30-day notice)',
      noticePeriodDays: 30,
      contractValue: 120000,
      currency: 'USD',
      paymentTerms: 'Net 30 Days from invoice receipt',
      terminationClause: 'Either party may terminate upon 30 days written notice prior to annual renewal date. Immediate termination permitted for material breach.',
      keyObligations: [
        { party: 'Acme Digital Solutions', description: 'Maintain security compliance certification and pay monthly usage fees.' },
        { party: 'AWS Cloud Platform Inc.', description: 'Guarantee 99.99% service uptime and provide 24/7 priority customer support.' }
      ],
      risks: [
        {
          title: 'Automatic 10% Price Increase on Renewal',
          description: 'Clause 8.3 stipulates that standard service rates increase by 10% automatically upon each annual renewal unless renegotiated in writing 60 days prior.',
          severity: 'High',
          evidence: 'Clause 8.3: Standard rates will increase by 10% automatically upon each annual renewal.'
        },
        {
          title: 'Uncapped Indemnification Liability',
          description: 'Limitation of liability clause excludes third-party IP infringement claims from standard liability caps.',
          severity: 'Critical',
          evidence: 'Section 14.2: Indemnification for third-party IP infringement shall be uncapped.'
        }
      ],
      riskLevel: 'Critical',
      importantDates: [
        { event: 'Notice Deadline', date: new Date('2026-08-01'), description: 'Last day to provide non-renewal notice' },
        { event: 'Contract Expiry', date: new Date('2026-09-01'), description: 'Contract expiration date' }
      ],
      summary: 'Comprehensive enterprise cloud infrastructure contract with AWS Cloud Platform. Key risks include an uncapped IP indemnification clause and an automatic 10% price escalation upon auto-renewal.',
      aiEvidence: [
        { field: 'Expiry Date', value: '2026-09-01', evidenceQuote: 'This Agreement shall commence on Sept 1, 2025 and expire on Sept 1, 2026.' },
        { field: 'Notice Period', value: '30 days', evidenceQuote: 'Written notice of non-renewal must be delivered at least thirty (30) days prior to expiration.' }
      ],
      renewalStatus: 'Expiring Soon',
      remindersSent: { '90': true, '60': true, '30': false, '15': false, '7': false, '1': false }
    },
    {
      _id: '66b53d01f1e2a3b4c5d6ea02',
      companyId: '66b53a01f1e2a3b4c5d6e701',
      documentId: '66b53c01f1e2a3b4c5d6e902',
      uploadedBy: '66b53b01f1e2a3b4c5d6e801',
      contractTitle: 'Enterprise CRM & Analytics SaaS Agreement',
      contractType: 'Software License',
      parties: ['Acme Digital Solutions', 'SalesGrid Global Corp'],
      startDate: new Date('2024-03-15'),
      expiryDate: new Date('2027-03-15'), // Safe / Active
      renewalDate: new Date('2027-01-15'),
      renewalType: 'Manual Opt-In',
      noticePeriodDays: 60,
      contractValue: 85000,
      currency: 'USD',
      paymentTerms: 'Annual upfront payment within 15 days of invoice date',
      terminationClause: '60 days advance written notice required prior to term completion.',
      keyObligations: [
        { party: 'Acme Digital Solutions', description: 'Ensure users comply with acceptable use guidelines and data privacy regulations.' },
        { party: 'SalesGrid Global Corp', description: 'Deliver quarterly software updates and 99.9% uptime availability.' }
      ],
      risks: [
        {
          title: 'Strict User License Overage Fees',
          description: 'Exceeding provisioned user licenses results in retroactive billing at 1.5x standard user rate.',
          severity: 'Medium',
          evidence: 'Section 4.1: Additional user accounts exceeding seat quota will be billed retroactively at 150% standard seat rate.'
        }
      ],
      riskLevel: 'Medium',
      importantDates: [
        { event: 'Notice Deadline', date: new Date('2027-01-15'), description: '60-day notice window' },
        { event: 'Expiration', date: new Date('2027-03-15'), description: 'Contract conclusion' }
      ],
      summary: '3-year master SaaS platform license for SalesGrid CRM. Payment is structured upfront annually with seat overage penalties.',
      aiEvidence: [
        { field: 'Contract Value', value: '$85,000 USD', evidenceQuote: 'Total annual contract fee is $85,000 USD payable upon commencement.' }
      ],
      renewalStatus: 'Active',
      remindersSent: { '90': false, '60': false, '30': false, '15': false, '7': false, '1': false }
    },
    {
      _id: '66b53d01f1e2a3b4c5d6ea03',
      companyId: '66b53a01f1e2a3b4c5d6e701',
      documentId: '66b53c01f1e2a3b4c5d6e903',
      uploadedBy: '66b53b01f1e2a3b4c5d6e802',
      contractTitle: 'Commercial Office Space Lease Agreement - HQ',
      contractType: 'Real Estate Lease',
      parties: ['Acme Digital Solutions', 'Apex Commercial Properties LLC'],
      startDate: new Date('2021-06-01'),
      expiryDate: new Date('2026-06-01'), // Expired
      renewalDate: new Date('2026-03-01'),
      renewalType: 'Manual Renewal Option',
      noticePeriodDays: 90,
      contractValue: 450000,
      currency: 'USD',
      paymentTerms: 'Monthly installment on the 1st of each calendar month',
      terminationClause: 'Early termination fee equivalent to 6 months base rent plus forfeiture of security deposit.',
      keyObligations: [
        { party: 'Acme Digital Solutions', description: 'Maintain premises insurance and property repair standards.' },
        { party: 'Apex Commercial Properties LLC', description: 'Provide building HVAC, structural maintenance, and security.' }
      ],
      risks: [
        {
          title: 'High Early Termination Penalty',
          description: 'Canceling lease prior to 2026 incurs a 6-month base rent fee.',
          severity: 'High',
          evidence: 'Clause 22: Tenant canceling prior to term completion shall pay 6 months base rent penalty.'
        }
      ],
      riskLevel: 'High',
      importantDates: [
        { event: 'Lease Expiry', date: new Date('2026-06-01'), description: 'Lease end date' }
      ],
      summary: 'Commercial office property lease agreement for corporate headquarters in Tech Park Plaza. Previously expired in June 2026.',
      aiEvidence: [
        { field: 'Expiry Date', value: '2026-06-01', evidenceQuote: 'Lease term shall terminate on June 1, 2026.' }
      ],
      renewalStatus: 'Expired',
      remindersSent: { '90': true, '60': true, '30': true, '15': true, '7': true, '1': true }
    },
    {
      _id: '66b53d01f1e2a3b4c5d6ea04',
      companyId: '66b53a01f1e2a3b4c5d6e701',
      documentId: '66b53c01f1e2a3b4c5d6e904',
      uploadedBy: '66b53b01f1e2a3b4c5d6e801',
      contractTitle: 'IT Security Audit & Compliance SOW',
      contractType: 'Professional Services',
      parties: ['Acme Digital Solutions', 'Vanguard Cybersecurity Experts'],
      startDate: new Date('2025-10-10'),
      expiryDate: new Date('2026-10-10'),
      renewalDate: new Date('2026-09-10'),
      renewalType: 'Non-Renewable',
      noticePeriodDays: 30,
      contractValue: 38000,
      currency: 'USD',
      paymentTerms: '50% upfront deposit, 50% upon final audit report delivery',
      terminationClause: 'Either party may terminate with 14 days written notice for convenience.',
      keyObligations: [
        { party: 'Vanguard Cybersecurity Experts', description: 'Deliver comprehensive penetration testing and SOC2 compliance audit report.' }
      ],
      risks: [
        {
          title: 'Standard Low Risk Agreement',
          description: 'Customary consulting terms with clear milestone deliverables and liability cap.',
          severity: 'Low',
          evidence: 'Clause 12: Total liability shall not exceed total project value of $38,000.'
        }
      ],
      riskLevel: 'Low',
      importantDates: [
        { event: 'Audit Delivery', date: new Date('2026-03-01'), description: 'Final report due' },
        { event: 'Expiry Date', date: new Date('2026-10-10'), description: 'Agreement end' }
      ],
      summary: 'Professional services contract for annual SOC2 audit and penetration testing. Project capped at $38,000 with clean liability limits.',
      aiEvidence: [
        { field: 'Notice Period', value: '30 days', evidenceQuote: '30 days written notice' }
      ],
      renewalStatus: 'Active',
      remindersSent: { '90': false, '60': false, '30': false, '15': false, '7': false, '1': false }
    }
  ],
  notifications: [
    {
      _id: '66b53e01f1e2a3b4c5d6eb01',
      companyId: '66b53a01f1e2a3b4c5d6e701',
      userId: '66b53b01f1e2a3b4c5d6e801',
      contractId: '66b53d01f1e2a3b4c5d6ea01',
      type: 'Renewal Reminder',
      title: 'Contract Expiry Approaching',
      message: 'Cloud Infrastructure Master Services Agreement expires in less than 30 days. Review notice terms before Aug 1, 2026.',
      scheduledFor: new Date(),
      sentAt: new Date(),
      read: false
    },
    {
      _id: '66b53e01f1e2a3b4c5d6eb02',
      companyId: '66b53a01f1e2a3b4c5d6e701',
      userId: '66b53b01f1e2a3b4c5d6e801',
      contractId: '66b53d01f1e2a3b4c5d6ea02',
      type: 'AI Analysis Completed',
      title: 'AI Contract Analysis Finished',
      message: 'Enterprise CRM & Analytics SaaS Agreement has been analyzed successfully by Groq AI.',
      scheduledFor: new Date(Date.now() - 86400000),
      sentAt: new Date(Date.now() - 86400000),
      read: true
    }
  ]
};

module.exports = seedData;
